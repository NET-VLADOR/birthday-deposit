import { StateCreator } from 'zustand';

export interface BeersSlice {
	beers: number[];
	addBeer: (price: number) => void;
	removeBeer: () => void;
	getBeersByPrice: () => Array<{ price: number; count: number }>;
}

export const createBeersSlice: StateCreator<BeersSlice> = (set, get) => ({
	beers: [],

	addBeer: (price = 300) =>
		set((state: BeersSlice) => ({
			beers: [...state.beers, price]
		})),

	removeBeer: () =>
		set((state: BeersSlice) => {
			if (state.beers.length === 0) return {};
			return {
				beers: state.beers.slice(0, -1)
			};
		}),

	getBeersByPrice: () => {
		const { beers } = get() as BeersSlice;
		const map = new Map<number, number>();

		for (const price of beers) {
			map.set(price, (map.get(price) || 0) + 1);
		}

		return Array.from(map.entries())
			.map(([price, count]) => ({ price, count }))
			.sort((a, b) => a.price - b.price);
	}
});
