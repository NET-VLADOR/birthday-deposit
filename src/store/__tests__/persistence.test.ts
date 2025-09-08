import { useDepositStore } from '../useDepositStore';

beforeEach(() => {
	useDepositStore.setState(useDepositStore.getInitialState());
});

describe('Persistence and Multiple Updates', () => {
	test('should handle multiple sequential imports correctly', () => {
		const { addReplenishment, addItem, addBeer, reset, getCalculatedBalance } = useDepositStore.getState();

		addReplenishment(1000);
		addItem('fries');
		addBeer(300);

		const firstExport = {
			orders: { ...useDepositStore.getState().orders },
			beers: [...useDepositStore.getState().beers],
			replenishments: [...useDepositStore.getState().replenishments],
			promos: [...useDepositStore.getState().promos],
			promoTransactions: [...useDepositStore.getState().promoTransactions],
			attempts: { ...useDepositStore.getState().attempts }
		};

		reset();

		firstExport.replenishments.forEach((amount) => addReplenishment(amount));
		Object.keys(firstExport.orders).forEach((id) => {
			const count = firstExport.orders[id];
			for (let i = 0; i < count; i++) {
				addItem(id);
			}
		});
		firstExport.beers.forEach((price) => addBeer(price));

		expect(useDepositStore.getState().orders['fries']).toBe(1);
		expect(useDepositStore.getState().beers).toEqual([300]);
		expect(useDepositStore.getState().replenishments).toEqual([1000]);

		addReplenishment(500);
		addItem('fries');
		addBeer(400);

		const secondExport = {
			orders: { ...useDepositStore.getState().orders },
			beers: [...useDepositStore.getState().beers],
			replenishments: [...useDepositStore.getState().replenishments],
			promos: [...useDepositStore.getState().promos],
			promoTransactions: [...useDepositStore.getState().promoTransactions],
			attempts: { ...useDepositStore.getState().attempts }
		};

		reset();

		secondExport.replenishments.forEach((amount) => addReplenishment(amount));
		Object.keys(secondExport.orders).forEach((id) => {
			const count = secondExport.orders[id];
			for (let i = 0; i < count; i++) {
				addItem(id);
			}
		});
		secondExport.beers.forEach((price) => addBeer(price));

		expect(useDepositStore.getState().orders['fries']).toBe(2);
		expect(useDepositStore.getState().beers).toEqual([300, 400]);
		expect(useDepositStore.getState().replenishments).toEqual([1000, 500]);
	});

	test('should handle promo code synchronization across multiple imports', () => {
		const { applyPromo, reset, addPromoTransaction, markPromoUsed } = useDepositStore.getState();

		applyPromo('OSTRO');

		const export1 = {
			promos: [...useDepositStore.getState().promos],
			promoTransactions: [...useDepositStore.getState().promoTransactions]
		};

		reset();

		export1.promos.forEach((importedPromo) => {
			if (importedPromo.used) {
				const existing = useDepositStore.getState().promos.find((p) => p.id === importedPromo.id);
				if (existing && !existing.used) {
					markPromoUsed(existing.id);
				}
			}
		});

		export1.promoTransactions.forEach((tx) => {
			const existingAts = new Set(useDepositStore.getState().promoTransactions.map((t) => t.at));
			if (!existingAts.has(tx.at)) {
				addPromoTransaction(tx);
			}
		});

		const secondTry = applyPromo('OSTRO');
		expect(secondTry).toBe(false);
	});

	test('should handle luck attempts synchronization across multiple imports', () => {
		const { unlockAttempt, tryLuck, reset } = useDepositStore.getState();

		unlockAttempt('first');
		tryLuck();

		const export1 = {
			attempts: { ...useDepositStore.getState().attempts }
		};

		reset();

		const { isAttemptUsed } = useDepositStore.getState();
		expect(isAttemptUsed('first')).toBe(true);

		if (export1.attempts.first) {
			unlockAttempt('first');
		}

		const secondTry = tryLuck();
		expect(secondTry).toBe(false);
	});

	test('should preserve localStorage state across resets', () => {
		const { unlockAttempt, tryLuck, reset } = useDepositStore.getState();

		unlockAttempt('first');
		tryLuck();

		reset();

		const { isAttemptUsed } = useDepositStore.getState();
		expect(isAttemptUsed('first')).toBe(true);
	});
});
