import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MenuItem = {
	id: string;
	name: string;
	price: number;
	category?: 'snack';
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
	{ id: 'sauce-hell', name: 'Соус "Ticket to Hell"', price: 200 },
	{ id: 'snack-peanuts', name: 'Арахис', price: 100, category: 'snack' },
	{ id: 'snack-chips', name: 'Чипсы', price: 130, category: 'snack' },
	{ id: 'snack-cheese', name: 'Сыр копченый', price: 250, category: 'snack' },
	{ id: 'snack-jerky', name: 'Джерки', price: 390, category: 'snack' },
	{ id: 'snack-popcorn', name: 'Попкорн', price: 100, category: 'snack' },
	{ id: 'snack-egg', name: 'Маринованное яйцо', price: 120, category: 'snack' }
];

export type PromoCode = {
	id: string;
	code: string;
	benefit: {
		type: 'free_item' | 'free_beer' | 'any_under';
		value: any;
		description: string;
	};
	used: boolean;
};

const initialPromos: PromoCode[] = [
	{
		id: 'p1',
		code: 'OSTRO',
		benefit: {
			type: 'free_item',
			value: 'chicken-wings',
			description: '🔥 Бесплатные острые крылья!'
		},
		used: false
	},
	{
		id: 'p2',
		code: 'CHERNOE',
		benefit: {
			type: 'free_beer',
			value: 'black',
			description: '🍺 Бесплатное черное пиво!'
		},
		used: false
	},
	{
		id: 'p3',
		code: 'PODAROK',
		benefit: {
			type: 'any_under',
			value: 500,
			description: '🎁 Любая позиция до 500₽ — бесплатно!'
		},
		used: false
	},
	{
		id: 'p4',
		code: 'TACOLOVE',
		benefit: {
			type: 'free_item',
			value: 'crispy-chicken-tacos',
			description: '🌮 Бесплатные такос!'
		},
		used: false
	},
	{
		id: 'p5',
		code: 'CHEESEPLZ',
		benefit: {
			type: 'free_item',
			value: 'cheese-tacos',
			description: '🧀 Бесплатная сырная тарелка!'
		},
		used: false
	}
];

type State = {
	orders: Record<string, number>;
	beers: number[];
	replenishments: number[];
	initialBalance: number;
	promos: PromoCode[];
	promoTransactions: Array<{ id: string; type: 'item' | 'beer'; price: number; at: number }>;
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

	getAvailablePromos: () => PromoCode[];
	getRandomPromo: () => PromoCode | null;
	issuePromo: (id: string) => PromoCode | null;
	applyPromo: (code: string) => boolean;

	markPromoUsed: (id: string) => void;
	addPromoTransaction: (transaction: { id: string; type: 'item' | 'beer'; price: number; at: number }) => void;
	getTotalPromoSpent: () => number;
};

const initialBalance = 15000;

export type UseDepositStore = State & Actions;

export const useDepositStore = create<UseDepositStore>()(
	persist(
		(set, get) => {
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

			return {
				orders: {},
				beers: [],
				replenishments: [],
				initialBalance,
				promos: initialPromos.map((p) => ({ ...p })),
				promoTransactions: [],

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
					const map = new Map<number, number>();

					for (const price of beers) {
						map.set(price, (map.get(price) || 0) + 1);
					}

					return Array.from(map.entries())
						.map(([price, count]) => ({ price, count }))
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
						replenishments: [],
						promoTransactions: [],
						promos: initialPromos.map((p) => ({ ...p }))
					}),

				getAvailablePromos: () => {
					const state = get();
					return state.promos.filter((p) => !p.used);
				},

				getRandomPromo: () => {
					const available = get().getAvailablePromos();
					if (available.length === 0) return null;
					const randomIndex = Math.floor(Math.random() * available.length);
					return available[randomIndex];
				},

				issuePromo: (id: string) => {
					const state = get();
					const promo = state.promos.find((p) => p.id === id && !p.used);
					if (!promo) return null;

					const { price, recordId, type } = calculatePromoBenefit(promo);

					if (price > 0) {
						set((state) => ({
							promoTransactions: [...state.promoTransactions, { id: recordId, type, price, at: Date.now() }]
						}));
					}

					set((state) => ({
						promos: state.promos.map((p) => (p.id === id ? { ...p, used: true } : p))
					}));

					return promo;
				},

				applyPromo: (code: string) => {
					const state = get();
					const promo = state.promos.find((p) => p.code === code.toUpperCase() && !p.used);
					if (!promo) return false;

					const { price, recordId, type } = calculatePromoBenefit(promo);

					if (price > 0) {
						state.addPromoTransaction({
							id: recordId,
							type,
							price,
							at: Date.now()
						});
					}

					state.markPromoUsed(promo.id);
					return true;
				},

				markPromoUsed: (id: string) =>
					set((state) => ({
						promos: state.promos.map((p) => (p.id === id ? { ...p, used: true } : p))
					})),

				addPromoTransaction: (transaction) =>
					set((state) => ({
						promoTransactions: [...state.promoTransactions, transaction]
					})),

				getTotalPromoSpent: () => {
					const state = get();
					return state.promoTransactions.reduce((sum, t) => sum + t.price, 0);
				}
			};
		},
		{
			name: 'deposit-storage'
		}
	)
);
