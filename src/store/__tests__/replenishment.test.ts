import { useDepositStore } from '../useDepositStore';

beforeEach(() => {
	useDepositStore.setState(useDepositStore.getInitialState());
});

describe('Replenishment Slice', () => {
	test('should initialize with empty replenishments', () => {
		const { replenishments } = useDepositStore.getState();
		expect(replenishments).toEqual([]);
	});

	test('should add replenishment and update total', () => {
		const { addReplenishment, getTotalReplenished } = useDepositStore.getState();

		addReplenishment(1000);
		addReplenishment(2000);

		expect(getTotalReplenished()).toBe(3000);
		expect(useDepositStore.getState().replenishments).toEqual([1000, 2000]);
	});

	test('should allow negative replenishments (for testing)', () => {
		const { addReplenishment, getTotalReplenished } = useDepositStore.getState();

		addReplenishment(-500);
		expect(getTotalReplenished()).toBe(-500);
	});
});
