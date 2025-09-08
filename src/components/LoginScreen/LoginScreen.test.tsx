import { render, screen, fireEvent } from '@testing-library/react';
import LoginScreen from './LoginScreen';
import { vi } from 'vitest';

describe('LoginScreen', () => {
	it('calls onLogin with "admin" when password is correct', () => {
		const mockOnLogin = vi.fn();
		render(<LoginScreen onLogin={mockOnLogin} />);

		fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'bd120925' } });
		fireEvent.click(screen.getByText('Войти'));

		expect(mockOnLogin).toHaveBeenCalledWith('admin');
	});

	it('calls onLogin with "guest" when password is incorrect', () => {
		const mockOnLogin = vi.fn();
		render(<LoginScreen onLogin={mockOnLogin} />);

		fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'wrong' } });
		fireEvent.click(screen.getByText('Войти'));

		expect(mockOnLogin).toHaveBeenCalledWith('guest');
	});

	it('triggers login on Enter key', () => {
		const mockOnLogin = vi.fn();
		render(<LoginScreen onLogin={mockOnLogin} />);

		const input = screen.getByPlaceholderText('Пароль');
		fireEvent.change(input, { target: { value: 'bd120925' } });
		fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

		expect(mockOnLogin).toHaveBeenCalledWith('admin');
	});
});
