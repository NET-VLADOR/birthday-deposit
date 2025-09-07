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
			beerCount: 0,
			customBeerPrice: 0,

			addBeer: (price = 0) =>
				set((state) => ({
					beerCount: state.beerCount + 1,
					customBeerPrice: price,
					balance: state.balance - price
				})),

			removeBeer: () =>
				set((state) => ({
					beerCount: Math.max(0, state.beerCount - 1),
					balance: state.balance + (state.customBeerPrice || 0)
				})),

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

			getTotalSpent: () => {
				const state = get();
				const foodTotal = Object.entries(state.orders).reduce((sum, [id, count]) => {
					const item = menuItems.find((i) => i.id === id);
					return sum + (item ? item.price * count : 0);
				}, 0);
				const beerTotal = state.beerCount * (state.customBeerPrice || 0);
				return foodTotal + beerTotal;
			},

			reset: () =>
				set({
					balance: initialBalance,
					orders: {},
					beerCount: 0,
					customBeerPrice: 0
				})
		}),
		{
			name: 'deposit-storage'
		}
	)
);
