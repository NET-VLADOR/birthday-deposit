import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

vi.mock('nanoid', () => ({
	nanoid: () => 'mock-id'
}));

describe('App', () => {
	beforeEach(() => {
		localStorageMock.clear();
	});

	it('renders LoginScreen when no role', () => {
		render(<App />);
		expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
	});

	it('logs in as admin and renders admin UI', async () => {
		render(<App />);

		fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'bd120925' } });
		fireEvent.click(screen.getByText('Войти'));

		await screen.findByText('Владос');
		expect(screen.getByText('💸 Пополнить баланс')).toBeInTheDocument();
		expect(screen.getByText('🗑️ Сбросить всё')).toBeInTheDocument();
	});

	it('logs out and returns to login', async () => {
		render(<App />);

		fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'bd120925' } });
		fireEvent.click(screen.getByText('Войти'));

		await screen.findByText('Выход');
		fireEvent.click(screen.getByText('Выход'));

		await screen.findByPlaceholderText('Пароль');
		expect(localStorage.getItem('userRole')).toBeNull();
	});
});
