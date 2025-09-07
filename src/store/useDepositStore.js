import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialBalance = 15000;

export const menuItems = [
	{ id: 'pate-small', name: 'Pate (маленькая)', price: 350 },
	{ id: 'pate-big', name: 'Pate (большая)', price: 700 },
	{ id: 'crispy-chicken-burger', name: 'Crispy Chicken Burger', price: 550 },
	{ id: 'pulled-pork-burger', name: 'Pulled Pork Burger', price: 550 },
	{ id: 'crispy-chicken-tacos', name: 'Crispy Chicken Tacos', price: 420 },
	{ id: 'pulled-pork-tacos', name: 'Pulled Pork Tacos', price: 420 },
	{ id: 'beef-tacos', name: 'Beef Tacos', price: 450 },
	{ id: 'cheese-tacos', name: 'Cheese Tacos', price: 420 },
	{ id: 'chicken-wings', name: 'Крылья куринные', price: 450 },
	{ id: 'fries', name: 'Картофель фри', price: 220 },
	{ id: 'sauce', name: 'Соус', price: 70 },
	{ id: 'sauce-hell', name: 'Соус "Ticket to Hell"', price: 200 }
];

export const useDepositStore = create(
	persist(
		(set, get) => ({
			balance: initialBalance,
			orders: {},
			beers: [],

			addBeer: (price = 300) =>
				set((state) => ({
					beers: [...state.beers, price],
					balance: state.balance - price
				})),

			removeBeer: () =>
				set((state) => {
					if (state.beers.length === 0) return {};
					const lastPrice = state.beers[state.beers.length - 1];
					return {
						beers: state.beers.slice(0, -1),
						balance: state.balance + lastPrice
					};
				}),

			addToBalance: (amount) => set((state) => ({ balance: state.balance + amount })),

			addItem: (id) => {
				const item = menuItems.find((i) => i.id === id);
				if (!item || get().balance < item.price) return;
				set((state) => ({
					orders: {
						...state.orders,
						[id]: (state.orders[id] || 0) + 1
					},
					balance: state.balance - item.price
				}));
			},

			removeItem: (id) => {
				const item = menuItems.find((i) => i.id === id);
				if (!item || !get().orders[id]) return;
				set((state) => {
					const newCount = state.orders[id] - 1;
					const newOrders = { ...state.orders };
					if (newCount <= 0) delete newOrders[id];
					else newOrders[id] = newCount;
					return {
						orders: newOrders,
						balance: state.balance + item.price
					};
				});
			},

			getBeersByPrice: () => {
				const { beers } = get();
				const map = {};
				beers.forEach((price) => {
					map[price] = (map[price] || 0) + 1;
				});
				return Object.entries(map)
					.map(([price, count]) => ({ price: parseInt(price), count }))
					.sort((a, b) => a.price - b.price);
			},

			getTotalBeerCount: () => get().beers.length,

			getTotalSpent: () => {
				const state = get();
				const foodTotal = Object.entries(state.orders).reduce((sum, [id, count]) => {
					const item = menuItems.find((i) => i.id === id);
					return sum + (item ? item.price * count : 0);
				}, 0);
				const beerTotal = state.beers.reduce((sum, price) => sum + price, 0);
				return foodTotal + beerTotal;
			},

			reset: () =>
				set({
					balance: initialBalance,
					orders: {},
					beers: []
				})
		}),
		{
			name: 'deposit-storage'
		}
	)
);
