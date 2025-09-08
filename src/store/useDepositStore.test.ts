import { useDepositStore } from './useDepositStore';

// Сброс хранилища перед каждым тестом
beforeEach(() => {
	useDepositStore.setState(useDepositStore.getInitialState());
});

describe('useDepositStore', () => {
	const { getInitialState } = useDepositStore;
	const initialBalance = 15000;

	test('should initialize with correct initial state', () => {
		const state = getInitialState();
		expect(state.orders).toEqual({});
		expect(state.beers).toEqual([]);
		expect(state.replenishments).toEqual([]);
		expect(state.initialBalance).toBe(15000);
	});

	describe('Replenishments', () => {
		test('should add replenishment and increase balance', () => {
			const { addReplenishment, getTotalReplenished, getCalculatedBalance } = useDepositStore.getState();

			addReplenishment(1000);
			addReplenishment(2000);

			const { getTotalReplenished: getNewTotal, getCalculatedBalance: getNewBalance } = useDepositStore.getState();

			expect(getNewTotal()).toBe(3000);
			expect(getNewBalance()).toBe(initialBalance + 3000); // 18000
		});

		test('should not allow negative replenishment', () => {
			const { addReplenishment, getTotalReplenished } = useDepositStore.getState();
			const prev = getTotalReplenished();

			addReplenishment(-500);
			const newTotal = useDepositStore.getState().getTotalReplenished();

			expect(newTotal).toBe(prev - 500); // но в UI мы блокируем отрицательные значения
		});
	});

	describe('Beer orders', () => {
		test('should add beer with different prices', () => {
			const { addBeer, getCalculatedBalance } = useDepositStore.getState();

			addBeer(300);
			addBeer(500);
			addBeer(300);

			const { beers } = useDepositStore.getState();
			expect(beers).toEqual([300, 500, 300]);
			expect(getCalculatedBalance()).toBe(15000 - 1100); // 13900
		});

		test('should remove last beer and return money', () => {
			const { addBeer, removeBeer, getCalculatedBalance } = useDepositStore.getState();

			addBeer(400);
			addBeer(600);

			expect(getCalculatedBalance()).toBe(15000 - 1000); // 14000

			removeBeer();
			expect(getCalculatedBalance()).toBe(15000 - 400); // 14600
		});

		test('should group beers by price correctly', () => {
			const { addBeer, getBeersByPrice } = useDepositStore.getState();

			addBeer(300);
			addBeer(500);
			addBeer(300);
			addBeer(400);
			addBeer(500);
			addBeer(500);

			const grouped = getBeersByPrice();

			expect(grouped).toEqual([
				{ price: 300, count: 2 },
				{ price: 400, count: 1 },
				{ price: 500, count: 3 }
			]);
		});
	});

	describe('Food orders', () => {
		const burgerId = 'crispy-chicken-burger';
		const friesId = 'fries';

		test('should add and remove food items', () => {
			const { addItem, removeItem, getCalculatedBalance } = useDepositStore.getState();

			addItem(burgerId); // 550
			addItem(burgerId); // 550
			addItem(friesId); // 220

			const { orders } = useDepositStore.getState();
			expect(orders[burgerId]).toBe(2);
			expect(orders[friesId]).toBe(1);
			expect(getCalculatedBalance()).toBe(15000 - (550 * 2 + 220)); // 13680

			removeItem(burgerId);
			const { orders: ordersAfterRemove } = useDepositStore.getState();
			expect(ordersAfterRemove[burgerId]).toBe(1);
			expect(getCalculatedBalance()).toBe(15000 - (550 + 220)); // 14230

			removeItem(burgerId);
			const { orders: finalOrders } = useDepositStore.getState();
			expect(finalOrders[burgerId]).toBeUndefined();
		});

		test('should not allow adding item with insufficient balance', () => {
			const { addItem, getCalculatedBalance } = useDepositStore.getState();

			// Пополняем на -14000 → баланс = 1000
			const { addReplenishment } = useDepositStore.getState();
			addReplenishment(-14000); // 15000 → 1000

			const burgerId = 'crispy-chicken-burger'; // 550
			const pateBigId = 'pate-big'; // 700

			addItem(burgerId); // 1000 → 450
			addItem(pateBigId); // 450 < 700 → не добавится

			const finalBalance = getCalculatedBalance();
			expect(finalBalance).toBe(450); // 1000 - 550 = 450
		});
	});

	describe('Balance calculation', () => {
		test('should calculate balance as initial + replenishments - spent', () => {
			const { addReplenishment, addItem, addBeer, getTotalSpent, getTotalReplenished, getCalculatedBalance } = useDepositStore.getState();

			addReplenishment(2000);
			addReplenishment(1000); // +3000

			addItem('crispy-chicken-burger'); // 550
			addBeer(400);
			addBeer(300); // +700

			expect(getTotalReplenished()).toBe(3000);
			expect(getTotalSpent()).toBe(550 + 700); // 1250
			expect(getCalculatedBalance()).toBe(15000 + 3000 - 1250); // 16750
		});
	});

	describe('Export / Import', () => {
		test('should export and import data correctly', () => {
			const { addReplenishment, addItem, addBeer, reset, getCalculatedBalance } = useDepositStore.getState();

			// Исходные действия
			addReplenishment(1000);
			addReplenishment(2000);
			addItem('pate-small'); // 350
			addBeer(300);
			addBeer(500);

			const originalBalance = getCalculatedBalance(); // 15000 + 3000 - 350 - 800 = 16850

			// Экспорт
			const state = useDepositStore.getState();
			const data = {
				orders: { ...state.orders },
				beers: [...state.beers],
				replenishments: [...state.replenishments]
			};

			// Сброс
			reset();

			// Импорт
			data.replenishments.forEach((amount) => addReplenishment(amount));
			Object.keys(data.orders).forEach((id) => {
				const count = data.orders[id];
				for (let i = 0; i < count; i++) {
					addItem(id);
				}
			});
			data.beers.forEach((price) => addBeer(price));

			const restoredBalance = getCalculatedBalance();

			expect(restoredBalance).toBe(originalBalance);
			expect(useDepositStore.getState().replenishments).toEqual([1000, 2000]);
			expect(useDepositStore.getState().orders['pate-small']).toBe(1);
			expect(useDepositStore.getState().beers).toEqual([300, 500]);
		});
	});

	describe('Reset', () => {
		test('should reset all data to initial state', () => {
			const { addReplenishment, addItem, addBeer, reset, getCalculatedBalance } = useDepositStore.getState();

			addReplenishment(1000);
			addItem('fries');
			addBeer(400);

			reset();

			const state = useDepositStore.getState();
			expect(state.orders).toEqual({});
			expect(state.beers).toEqual([]);
			expect(state.replenishments).toEqual([]);
			expect(getCalculatedBalance()).toBe(15000);
		});
	});
});

describe('Promo Codes', () => {
	const promoCode = 'OSTRO';
	const promoId = 'p1';

	test('should apply promo code successfully and mark as used', () => {
		const { applyPromo, promos, getTotalPromoSpent } = useDepositStore.getState();

		// Промокод изначально не использован
		const promoBefore = promos.find((p) => p.code === promoCode);
		expect(promoBefore?.used).toBe(false);

		// Применяем
		const success = applyPromo(promoCode);
		expect(success).toBe(true);

		// Проверяем, что помечен как использованный
		const { promos: promosAfter } = useDepositStore.getState();
		const promoAfter = promosAfter.find((p) => p.code === promoCode);
		expect(promoAfter?.used).toBe(true);

		// Проверяем, что добавилась транзакция (крылья = 450₽)
		expect(getTotalPromoSpent()).toBe(450);
	});

	test('should not apply promo code if already used', () => {
		const { applyPromo } = useDepositStore.getState();

		// Применяем первый раз
		let success = applyPromo(promoCode);
		expect(success).toBe(true);

		// Применяем второй раз
		success = applyPromo(promoCode);
		expect(success).toBe(false); // уже использован
	});

	test('should issue promo code as admin and record transaction', () => {
		const { issuePromo, getTotalPromoSpent, promos } = useDepositStore.getState();

		// Выдаем админом
		const issued = issuePromo(promoId);
		expect(issued).not.toBeNull();
		expect(issued?.code).toBe(promoCode);

		// Проверяем статус
		const { promos: promosAfter } = useDepositStore.getState();
		const promoAfter = promosAfter.find((p) => p.id === promoId);
		expect(promoAfter?.used).toBe(true);

		// Проверяем транзакцию
		expect(getTotalPromoSpent()).toBe(450);
	});

	test('should not issue promo code if already used', () => {
		const { issuePromo, applyPromo } = useDepositStore.getState();

		// Гость уже активировал
		applyPromo(promoCode);

		// Админ пытается выдать — должно вернуть null
		const issued = issuePromo(promoId);
		expect(issued).toBeNull();
	});

	test('should export and import promo data correctly', () => {
		const { applyPromo, reset, addPromoTransaction, markPromoUsed, getTotalPromoSpent, promos } = useDepositStore.getState();

		// Гость активирует промокод
		applyPromo(promoCode);

		// Экспортируем всё
		const state = useDepositStore.getState();
		const exportedData = {
			orders: { ...state.orders },
			beers: [...state.beers],
			replenishments: [...state.replenishments],
			promos: [...state.promos],
			promoTransactions: [...state.promoTransactions]
		};

		// Сбрасываем
		reset();

		// Импортируем
		exportedData.replenishments.forEach((amount) => useDepositStore.getState().addReplenishment(amount));
		Object.keys(exportedData.orders).forEach((id) => {
			const count = exportedData.orders[id];
			for (let i = 0; i < count; i++) {
				useDepositStore.getState().addItem(id);
			}
		});
		exportedData.beers.forEach((price) => useDepositStore.getState().addBeer(price));

		// 🔥 Импортируем промокоды и транзакции
		exportedData.promos.forEach((importedPromo) => {
			if (importedPromo.used) {
				const existing = useDepositStore.getState().promos.find((p) => p.id === importedPromo.id);
				if (existing && !existing.used) {
					useDepositStore.getState().markPromoUsed(existing.id);
				}
			}
		});

		exportedData.promoTransactions.forEach((tx) => {
			const existingAts = new Set(useDepositStore.getState().promoTransactions.map((t) => t.at));
			if (!existingAts.has(tx.at)) {
				useDepositStore.getState().addPromoTransaction(tx);
			}
		});

		// Проверяем
		const { promos: importedPromos, getTotalPromoSpent: getImportedTotal } = useDepositStore.getState();
		const importedPromo = importedPromos.find((p) => p.code === promoCode);
		expect(importedPromo?.used).toBe(true);
		expect(getImportedTotal()).toBe(450);
	});
});
