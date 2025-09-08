import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

Object.defineProperty(navigator, 'clipboard', {
	value: {
		writeText: vi.fn().mockResolvedValue(undefined),
		readText: vi.fn().mockResolvedValue('')
	},
	writable: true,
	configurable: true
});
