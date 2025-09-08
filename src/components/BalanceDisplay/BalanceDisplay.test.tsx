import { render, screen } from '@testing-library/react';
import BalanceDisplay from './BalanceDisplay';

describe('BalanceDisplay', () => {
	it('renders balance with green color when >= 6000', () => {
		render(<BalanceDisplay balance={7000} />);
		const balanceElement = screen.getByText('7,000 ₽');
		expect(balanceElement).toHaveClass('text-ctp-green');
	});

	it('renders balance with yellow color when >= 3000 and < 6000', () => {
		render(<BalanceDisplay balance={4500} />);
		const balanceElement = screen.getByText('4,500 ₽');
		expect(balanceElement).toHaveClass('text-ctp-yellow');
	});

	it('renders balance with red color when < 3000', () => {
		render(<BalanceDisplay balance={2000} />);
		const balanceElement = screen.getByText('2,000 ₽');
		expect(balanceElement).toHaveClass('text-ctp-red');
	});

	it('formats balance with toLocaleString', () => {
		render(<BalanceDisplay balance={123456} />);
		expect(screen.getByText('123,456 ₽')).toBeInTheDocument();
	});
});
