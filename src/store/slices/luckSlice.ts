import { StateCreator } from 'zustand';

export interface LuckSlice {
	attempts: {
		first: boolean;
		second: boolean;
		third: boolean;
	};
	unlockAttempt: (attempt: 'first' | 'second' | 'third') => void;
	tryLuck: () => boolean;
	hasAttempt: (attempt: 'first' | 'second' | 'third') => boolean;
	isAttemptUsed: (attempt: 'first' | 'second' | 'third') => boolean;
	markAttemptUsed: (attempt: 'first' | 'second' | 'third') => void;
}

export const createLuckSlice: StateCreator<LuckSlice> = (set, get) => ({
	attempts: { first: false, second: false, third: false },

	unlockAttempt: (attempt: 'first' | 'second' | 'third') =>
		set((state: LuckSlice) => ({
			attempts: {
				...state.attempts,
				[attempt]: true
			}
		})),

	hasAttempt: (attempt: 'first' | 'second' | 'third') => {
		const state = get() as LuckSlice;
		return state.attempts[attempt];
	},

	isAttemptUsed: (attempt: 'first' | 'second' | 'third') => {
		const key = `luck_attempt_used_${attempt}`;
		return localStorage.getItem(key) === 'true';
	},

	markAttemptUsed: (attempt: 'first' | 'second' | 'third') => {
		const key = `luck_attempt_used_${attempt}`;
		localStorage.setItem(key, 'true');
	},

	tryLuck: () => {
		const state = get() as LuckSlice;

		const attempts = ['first', 'second', 'third'] as const;
		const availableAttempt = attempts.find((key) => state.attempts[key] && !state.isAttemptUsed(key));

		if (!availableAttempt) return false;

		const won = Math.random() < 0.05;

		state.markAttemptUsed(availableAttempt);

		set((state: LuckSlice) => ({
			attempts: {
				...state.attempts,
				[availableAttempt]: false
			}
		}));

		return won;
	}
});
