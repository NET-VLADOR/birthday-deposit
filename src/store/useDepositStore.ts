import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { createOrdersSlice } from './slices/ordersSlice';
import { createBeersSlice } from './slices/beersSlice';
import { createReplenishmentSlice } from './slices/replenishmentSlice';
import { createPromosSlice } from './slices/promosSlice';
import { createLuckSlice } from './slices/luckSlice';
import { initialPromos, menuItems } from './types';

export type { MenuItem, PromoCode } from './types';

export { menuItems, initialPromos, initialBalance } from './types';

export type UseDepositStore = ReturnType<typeof createOrdersSlice> &
	ReturnType<typeof createBeersSlice> &
	ReturnType<typeof createReplenishmentSlice> &
	ReturnType<typeof createPromosSlice> &
	ReturnType<typeof createLuckSlice> & {
		reset: () => void;
		getTotalSpent: () => number;
		getCalculatedBalance: () => number;
	};

export const useDepositStore = create<UseDepositStore>()(
	persist(
		devtools(
			(set, get, api) => ({
				...createOrdersSlice(set, get, api),
				...createBeersSlice(set, get, api),
				...createReplenishmentSlice(set, get, api),
				...createPromosSlice(set, get, api),
				...createLuckSlice(set, get, api),

				reset: () =>
					set({
						orders: {},
						beers: [],
						replenishments: [],
						promoTransactions: [],
						promos: initialPromos.map((p) => ({ ...p })),
						attempts: { first: false, second: false, third: false }
					}),

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
				}
			}),
			{ name: 'deposit-storage' }
		),
		{
			name: 'deposit-storage'
		}
	)
);
