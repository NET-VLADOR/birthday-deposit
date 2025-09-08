import { StateCreator } from 'zustand';
import { PromoCode, menuItems, initialPromos } from '../types';

export interface PromosSlice {
	promos: PromoCode[];
	promoTransactions: Array<{ id: string; type: 'item' | 'beer'; price: number; at: number }>;
	getAvailablePromos: () => PromoCode[];
	getRandomPromo: () => PromoCode | null;
	issuePromo: (id: string) => PromoCode | null;
	applyPromo: (code: string) => boolean;
	markPromoUsed: (id: string) => void;
	addPromoTransaction: (transaction: { id: string; type: 'item' | 'beer'; price: number; at: number }) => void;
	getTotalPromoSpent: () => number;
}

const calculatePromoBenefit = (promo: PromoCode) => {
	let price = 0;
	let recordId = '';
	let type: 'item' | 'beer' = 'item';

	switch (promo.benefit.type) {
		case 'free_item': {
			const item = menuItems.find((i) => i.id === promo.benefit.value);
			if (item) {
				price = item.price;
				recordId = item.id;
				type = 'item';
			}
			break;
		}
		case 'free_beer': {
			price = promo.benefit.value === 'black' ? 400 : 300;
			recordId = 'beer';
			type = 'beer';
			break;
		}
		case 'any_under': {
			const eligible = menuItems.find((item) => item.price <= promo.benefit.value);
			if (eligible) {
				price = eligible.price;
				recordId = eligible.id;
				type = 'item';
			}
			break;
		}
	}

	return { price, recordId, type };
};

export const createPromosSlice: StateCreator<PromosSlice> = (set, get) => ({
	promos: initialPromos.map((p) => ({ ...p })),
	promoTransactions: [],

	getAvailablePromos: () => {
		const state = get() as PromosSlice;
		return state.promos.filter((p) => !p.used);
	},

	getRandomPromo: () => {
		const available = (get() as PromosSlice).getAvailablePromos();
		if (available.length === 0) return null;
		const randomIndex = Math.floor(Math.random() * available.length);
		return available[randomIndex];
	},

	issuePromo: (id: string) => {
		const state = get() as PromosSlice;
		const promo = state.promos.find((p) => p.id === id && !p.used);
		if (!promo) return null;

		const { price, recordId, type } = calculatePromoBenefit(promo);

		if (price > 0) {
			set((state: PromosSlice) => ({
				promoTransactions: [...state.promoTransactions, { id: recordId, type, price, at: Date.now() }]
			}));
		}

		set((state: PromosSlice) => ({
			promos: state.promos.map((p) => (p.id === id ? { ...p, used: true } : p))
		}));

		return promo;
	},

	applyPromo: (code: string) => {
		const state = get() as PromosSlice;
		const promo = state.promos.find((p) => p.code === code.toUpperCase() && !p.used);
		if (!promo) return false;

		const { price, recordId, type } = calculatePromoBenefit(promo);

		if (price > 0) {
			(get() as PromosSlice).addPromoTransaction({
				id: recordId,
				type,
				price,
				at: Date.now()
			});
		}

		(get() as PromosSlice).markPromoUsed(promo.id);
		return true;
	},

	markPromoUsed: (id: string) =>
		set((state: PromosSlice) => ({
			promos: state.promos.map((p) => (p.id === id ? { ...p, used: true } : p))
		})),

	addPromoTransaction: (transaction) =>
		set((state: PromosSlice) => ({
			promoTransactions: [...state.promoTransactions, transaction]
		})),

	getTotalPromoSpent: () => {
		const state = get() as PromosSlice;
		return state.promoTransactions.reduce((sum, t) => sum + t.price, 0);
	}
});
