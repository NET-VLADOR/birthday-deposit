import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type MenuItem = {
	id: string;
	name: string;
	price: number;
};

type State = {
	orders: Record<string, number>;
	beers: number[];
	replenishments: number[];
	initialBalance: number;
};

type Actions = {
	addBeer: (price: number) => void;
	removeBeer: () => void;
	addReplenishment: (amount: number) => void;
	addItem: (id: string) => void;
	removeItem: (id: string) => void;
	reset: () => void;

	getTotalSpent: () => number;
	getTotalReplenished: () => number;
	getCalculatedBalance: () => number;
	getBeersByPrice: () => Array<{ price: number; count: number }>;
};

export const menuItems: MenuItem[] = [
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

const initialBalance = 15000;

export type UseDepositStore = State & Actions;

export const useDepositStore = create<UseDepositStore>()(
	persist(
		(set, get) => ({
			orders: {},
			beers: [],
			replenishments: [],
			initialBalance,

			getTotalReplenished: () => get().replenishments.reduce((sum, amount) => sum + amount, 0),

			addReplenishment: (amount) =>
				set((state) => ({
					replenishments: [...state.replenishments, amount]
				})),

			addBeer: (price = 300) =>
				set((state) => ({
					beers: [...state.beers, price]
				})),

			removeBeer: () =>
				set((state) => {
					if (state.beers.length === 0) return {};
					return {
						beers: state.beers.slice(0, -1)
					};
				}),

			addItem: (id) => {
				const item = menuItems.find((i) => i.id === id);
				if (!item) return;

				const currentBalance = get().getCalculatedBalance();
				if (currentBalance >= item.price) {
					set((state) => ({
						orders: {
							...state.orders,
							[id]: (state.orders[id] || 0) + 1
						}
					}));
				}
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
						orders: newOrders
					};
				});
			},

			getBeersByPrice: () => {
				const { beers } = get();
				const map: Record<number, number> = {};
				beers.forEach((price) => {
					map[price] = (map[price] || 0) + 1;
				});
				return Object.entries(map)
					.map(([price, count]) => ({ price: parseInt(price), count }))
					.sort((a, b) => a.price - b.price);
			},

			getTotalSpent: () => {
				const state = get();
				const foodTotal = Object.entries(state.orders).reduce((sum, [id, count]) => {
					const item = menuItems.find((i) => i.id === id);
					return sum + (item ? item.price * count : 0);
				}, 0);
				const beerTotal = state.beers.reduce((sum, price) => sum + price, 0);
				return foodTotal + beerTotal;
			},

			getCalculatedBalance: () => {
				const state = get();
				const totalSpent = state.getTotalSpent();
				const totalReplenished = state.getTotalReplenished();
				return state.initialBalance + totalReplenished - totalSpent;
			},

			reset: () =>
				set({
					orders: {},
					beers: [],
					replenishments: []
				})
		}),
		{
			name: 'deposit-storage'
		}
	)
);
