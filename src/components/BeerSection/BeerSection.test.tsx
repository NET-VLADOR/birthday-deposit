import { render, screen, fireEvent } from '@testing-library/react';
import BeerSection from './BeerSection';
import { vi } from 'vitest';

const mockAddBeer = vi.fn();
const mockRemoveBeer = vi.fn();
const mockShowNotification = vi.fn();

const defaultProps = {
	beers: [300, 300],
	getBeersByPrice: () => [{ price: 300, count: 2 }],
	addBeer: mockAddBeer,
	removeBeer: mockRemoveBeer,
	calculatedBalance: 1000,
	role: 'admin' as const,
	showNotification: mockShowNotification
};

describe('BeerSection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders beer list for admin', () => {
		render(<BeerSection {...defaultProps} />);

		const beerParagraphs = screen.getAllByRole('paragraph');
		const targetBeerItem = beerParagraphs.find((p) => {
			const text = p.textContent || '';
			return text.includes('🍺') && text.includes('300') && text.includes('₽') && text.includes('×2');
		});

		expect(targetBeerItem).toBeInTheDocument();

		expect(screen.getByPlaceholderText('Цена')).toBeInTheDocument();
		expect(screen.getByText('+1 Пиво')).toBeInTheDocument();
		expect(screen.getByText('-1')).toBeInTheDocument();
	});

	it('does not render admin controls for guest', () => {
		render(<BeerSection {...defaultProps} role="guest" />);
		expect(screen.queryByPlaceholderText('Цена')).not.toBeInTheDocument();
		expect(screen.queryByText('+1 Пиво')).not.toBeInTheDocument();
		expect(screen.queryByText('-1')).not.toBeInTheDocument();
	});

	it('disables +1 button when price is invalid or exceeds balance', () => {
		render(<BeerSection {...defaultProps} calculatedBalance={200} />);
		const input = screen.getByPlaceholderText('Цена');
		fireEvent.change(input, { target: { value: '300' } });

		const addButton = screen.getByText('+1 Пиво');
		expect(addButton).toBeDisabled();

		fireEvent.change(input, { target: { value: '-50' } });
		expect(addButton).toBeDisabled();

		fireEvent.change(input, { target: { value: '150' } });
		expect(addButton).not.toBeDisabled();
	});

	it('calls addBeer and resets input on valid add', () => {
		render(<BeerSection {...defaultProps} />);
		const input = screen.getByPlaceholderText('Цена');
		fireEvent.change(input, { target: { value: '400' } });
		fireEvent.click(screen.getByText('+1 Пиво'));

		expect(mockAddBeer).toHaveBeenCalledWith(400);
		expect(input).toHaveValue(300);
	});

	it('disables remove button when no beers', () => {
		render(<BeerSection {...defaultProps} beers={[]} getBeersByPrice={() => []} />);
		const removeButton = screen.getByText('-1');
		expect(removeButton).toBeDisabled();
	});

	it('shows "Пока нет пива😢" when no beers', () => {
		render(<BeerSection {...defaultProps} beers={[]} getBeersByPrice={() => []} />);
		expect(screen.getByText('Пока нет пива😢')).toBeInTheDocument();
	});
});
