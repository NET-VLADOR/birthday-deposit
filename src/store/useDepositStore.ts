import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set as firebaseSet, get as firebaseGet, off, onValue } from 'firebase/database';
import { createOrdersSlice } from './slices/ordersSlice';
import { createBeersSlice } from './slices/beersSlice';
import { createReplenishmentSlice } from './slices/replenishmentSlice';
import { createPromosSlice } from './slices/promosSlice';
import { createLuckSlice } from './slices/luckSlice';
import { initialPromos, menuItems, PromoCode } from './types';
export type { MenuItem, PromoCode } from './types';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const SYNC_KEY = 'party_12_09_25';

export type UseDepositStore = ReturnType<typeof createOrdersSlice> &
	ReturnType<typeof createBeersSlice> &
	ReturnType<typeof createReplenishmentSlice> &
	ReturnType<typeof createPromosSlice> &
	ReturnType<typeof createLuckSlice> & {
		reset: () => void;
		getTotalSpent: () => number;
		getCalculatedBalance: () => number;
		syncToCloud: () => Promise<void>;
		syncFromCloud: () => Promise<void>;
		startListeningToCloud: (onUpdate: () => void) => () => void;
		showNotification: (message: string, type?: 'success' | 'error') => void;
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
				},

				startListeningToCloud: (onUpdate) => {
					const dbRef = ref(database, SYNC_KEY);

					const handleSnapshot = (snapshot: any) => {
						if (snapshot.exists()) {
							onUpdate();
						}
					};

					onValue(dbRef, handleSnapshot);

					return () => {
						off(dbRef, 'value', handleSnapshot);
					};
				},

				syncToCloud: async () => {
					const state = get();
					const data = {
						orders: state.orders,
						beers: state.beers,
						replenishments: state.replenishments,
						promos: state.promos,
						promoTransactions: state.promoTransactions,
						attempts: state.attempts,
						updatedAt: Date.now()
					};

					try {
						await firebaseSet(ref(database, SYNC_KEY), data);
						state.showNotification('✅ Данные сохранены в облаке!', 'success');
					} catch (error) {
						console.error('Firebase sync error:', error);
						state.showNotification('❌ Не удалось сохранить в облаке', 'error');
					}
				},

				syncFromCloud: async () => {
					try {
						const snapshot = await firebaseGet(ref(database, SYNC_KEY));
						if (!snapshot.exists()) {
							get().showNotification('⚠️ Нет данных в облаке', 'error');
							return;
						}

						const data = snapshot.val();

						get().reset();

						if (Array.isArray(data.replenishments)) {
							data.replenishments.forEach((amount: number) => {
								get().addReplenishment(amount);
							});
						}

						if (data.orders && typeof data.orders === 'object') {
							Object.entries(data.orders).forEach(([id, count]) => {
								const importedCount = count as number;
								for (let i = 0; i < importedCount; i++) {
									get().addItem(id);
								}
							});
						}

						if (Array.isArray(data.beers)) {
							data.beers.forEach((price: number) => {
								get().addBeer(price);
							});
						}

						if (Array.isArray(data.promos)) {
							data.promos.forEach((importedPromo: PromoCode) => {
								if (importedPromo.used) {
									const existing = get().promos.find((p) => p.id === importedPromo.id);
									if (existing && !existing.used) {
										get().markPromoUsed(existing.id);
									}
								}
							});
						}

						if (Array.isArray(data.promoTransactions)) {
							data.promoTransactions.forEach((tx: any) => {
								get().addPromoTransaction(tx);
							});
						}

						if (data.attempts) {
							set({
								attempts: {
									first: data.attempts.first,
									second: data.attempts.second,
									third: data.attempts.third
								}
							});
						}

						get().showNotification('🎉 Данные загружены из облака!', 'success');
					} catch (error) {
						console.error('Firebase sync error:', error);
						get().showNotification('❌ Не удалось загрузить из облака', 'error');
					}
				}
			}),
			{ name: 'deposit-storage' }
		),
		{
			name: 'deposit-storage'
		}
	)
);
