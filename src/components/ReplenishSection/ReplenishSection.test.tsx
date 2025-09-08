import { render, screen, fireEvent } from '@testing-library/react';
import ReplenishSection from './ReplenishSection';
import { vi } from 'vitest';

describe('ReplenishSection', () => {
	it('calls onReplenish with valid amount', () => {
		const mockOnReplenish = vi.fn();
		const mockShowNotification = vi.fn();
		render(<ReplenishSection onReplenish={mockOnReplenish} showNotification={mockShowNotification} />);

		fireEvent.change(screen.getByPlaceholderText('Сумма'), { target: { value: '500' } });
		fireEvent.click(screen.getByText('Пополнить'));

		expect(mockOnReplenish).toHaveBeenCalledWith(500);
		expect(mockShowNotification).toHaveBeenCalledWith('✅ Баланс пополнен');
	});

	it('does nothing if amount is not positive', () => {
		const mockOnReplenish = vi.fn();
		render(<ReplenishSection onReplenish={mockOnReplenish} showNotification={() => {}} />);

		fireEvent.change(screen.getByPlaceholderText('Сумма'), { target: { value: '0' } });
		fireEvent.click(screen.getByText('Пополнить'));
		expect(mockOnReplenish).not.toHaveBeenCalled();

		fireEvent.change(screen.getByPlaceholderText('Сумма'), { target: { value: '-100' } });
		fireEvent.click(screen.getByText('Пополнить'));
		expect(mockOnReplenish).not.toHaveBeenCalled();
	});
});
