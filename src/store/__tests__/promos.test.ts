import { useDepositStore } from '../useDepositStore';

beforeEach(() => {
	useDepositStore.setState(useDepositStore.getInitialState());
});

describe('Promos Slice', () => {
	const promoCode = 'OSTRO';
	const promoId = 'p1';

	test('should initialize with unused promos', () => {
		const { promos } = useDepositStore.getState();
		const promo = promos.find((p) => p.code === promoCode);
		expect(promo?.used).toBe(false);
	});

	test('should apply promo code successfully and mark as used', () => {
		const { applyPromo, promos, getTotalPromoSpent } = useDepositStore.getState();

		const success = applyPromo(promoCode);
		expect(success).toBe(true);

		const promoAfter = useDepositStore.getState().promos.find((p) => p.code === promoCode);
		expect(promoAfter?.used).toBe(true);
		expect(getTotalPromoSpent()).toBe(450);
	});

	test('should not apply promo code if already used', () => {
		const { applyPromo } = useDepositStore.getState();

		applyPromo(promoCode);
		const secondTry = applyPromo(promoCode);
		expect(secondTry).toBe(false);
	});

	test('should issue promo code as admin and record transaction', () => {
		const { issuePromo, getTotalPromoSpent, promos } = useDepositStore.getState();

		const issued = issuePromo(promoId);
		expect(issued).not.toBeNull();
		expect(issued?.code).toBe(promoCode);

		const promoAfter = useDepositStore.getState().promos.find((p) => p.id === promoId);
		expect(promoAfter?.used).toBe(true);
		expect(getTotalPromoSpent()).toBe(450);
	});

	test('should not issue promo code if already used', () => {
		const { issuePromo, applyPromo } = useDepositStore.getState();

		applyPromo(promoCode);
		const issued = issuePromo(promoId);
		expect(issued).toBeNull();
	});

	test('should get available promos correctly', () => {
		const { getAvailablePromos, issuePromo } = useDepositStore.getState();

		let available = getAvailablePromos();
		expect(available.length).toBeGreaterThan(0);

		issuePromo('p1');
		available = getAvailablePromos();
		expect(available.some((p) => p.id === 'p1')).toBe(false);
	});

	test('should get random promo from available', () => {
		const { getRandomPromo, issuePromo } = useDepositStore.getState();

		const first = getRandomPromo();
		expect(first).not.toBeNull();

		issuePromo(first!.id);
		const second = getRandomPromo();
		expect(second).not.toBeNull();
		expect(second?.id).not.toBe(first?.id);
	});
});
