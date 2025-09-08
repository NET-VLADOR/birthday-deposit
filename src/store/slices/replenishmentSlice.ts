import { StateCreator } from 'zustand';
import { initialBalance } from '../types';

export interface ReplenishmentSlice {
	replenishments: number[];
	initialBalance: number;
	addReplenishment: (amount: number) => void;
	getTotalReplenished: () => number;
}

export const createReplenishmentSlice: StateCreator<ReplenishmentSlice> = (set, get) => ({
	replenishments: [],
	initialBalance,

	addReplenishment: (amount) =>
		set((state: ReplenishmentSlice) => ({
			replenishments: [...state.replenishments, amount]
		})),

	getTotalReplenished: () => get().replenishments.reduce((sum, amount) => sum + amount, 0)
});
