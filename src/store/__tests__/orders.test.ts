import { useDepositStore } from '../useDepositStore';
import { menuItems } from '../types';

beforeEach(() => {
	useDepositStore.setState(useDepositStore.getInitialState());
});

describe('Orders Slice', () => {
	test('should initialize with empty orders', () => {
		const { orders } = useDepositStore.getState();
		expect(orders).toEqual({});
	});

	test('should add item if balance sufficient', () => {
		const { addItem, getCalculatedBalance } = useDepositStore.getState();
		const burger = menuItems.find((item) => item.id === 'crispy-chicken-burger')!;

		addItem(burger.id);
		expect(useDepositStore.getState().orders[burger.id]).toBe(1);
		expect(getCalculatedBalance()).toBe(15000 - burger.price);
	});

	test('should not add item if balance insufficient', () => {
		const { addItem, addReplenishment, getCalculatedBalance } = useDepositStore.getState();
		const expensiveItem = menuItems.find((item) => item.id === 'pate-big')!;

		addReplenishment(-14500);

		addItem(expensiveItem.id);
		expect(useDepositStore.getState().orders[expensiveItem.id]).toBeUndefined();
		expect(getCalculatedBalance()).toBe(500);
	});

	test('should remove item and delete key if count <= 0', () => {
		const { addItem, removeItem } = useDepositStore.getState();
		const friesId = 'fries';

		addItem(friesId);
		addItem(friesId);
		expect(useDepositStore.getState().orders[friesId]).toBe(2);

		removeItem(friesId);
		expect(useDepositStore.getState().orders[friesId]).toBe(1);

		removeItem(friesId);
		expect(useDepositStore.getState().orders[friesId]).toBeUndefined();
	});
});
