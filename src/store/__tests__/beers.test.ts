import { useDepositStore } from '../useDepositStore';

beforeEach(() => {
	useDepositStore.setState(useDepositStore.getInitialState());
});

describe('Beers Slice', () => {
	test('should initialize with empty beers', () => {
		const { beers } = useDepositStore.getState();
		expect(beers).toEqual([]);
	});

	test('should add beer with specified price', () => {
		const { addBeer } = useDepositStore.getState();

		addBeer(350);
		addBeer(450);

		const { beers } = useDepositStore.getState();
		expect(beers).toEqual([350, 450]);
	});

	test('should remove last beer', () => {
		const { addBeer, removeBeer } = useDepositStore.getState();

		addBeer(300);
		addBeer(500);
		expect(useDepositStore.getState().beers.length).toBe(2);

		removeBeer();
		expect(useDepositStore.getState().beers).toEqual([300]);
	});

	test('should not remove beer if none exist', () => {
		const { removeBeer, beers } = useDepositStore.getState();
		const initialLength = beers.length;

		removeBeer();
		expect(useDepositStore.getState().beers.length).toBe(initialLength);
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
