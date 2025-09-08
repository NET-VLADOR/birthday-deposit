import { useDepositStore } from '../useDepositStore';

beforeEach(() => {
	useDepositStore.setState(useDepositStore.getInitialState());
	Object.keys(localStorage).forEach((key) => {
		if (key.startsWith('luck_attempt_used_')) {
			localStorage.removeItem(key);
		}
	});
});

describe('Luck Slice', () => {
	test('should initialize with all attempts locked', () => {
		const { attempts } = useDepositStore.getState();
		expect(attempts.first).toBe(false);
		expect(attempts.second).toBe(false);
		expect(attempts.third).toBe(false);
	});

	test('should unlock attempt', () => {
		const { unlockAttempt, hasAttempt } = useDepositStore.getState();

		unlockAttempt('first');
		expect(hasAttempt('first')).toBe(true);
	});

	test('should try luck and consume attempt', () => {
		const { unlockAttempt, tryLuck, hasAttempt } = useDepositStore.getState();

		unlockAttempt('first');
		expect(hasAttempt('first')).toBe(true);

		const won = tryLuck();
		expect(typeof won).toBe('boolean');

		expect(hasAttempt('first')).toBe(false);
	});

	test('should not allow trying luck without unlocked attempt', () => {
		const { tryLuck } = useDepositStore.getState();
		const won = tryLuck();
		expect(won).toBe(false);
	});

	test('should mark attempt as used in localStorage', () => {
		const { unlockAttempt, tryLuck } = useDepositStore.getState();

		unlockAttempt('first');
		tryLuck();

		expect(localStorage.getItem('luck_attempt_used_first')).toBe('true');
	});

	test('should not allow reusing attempt even after re-import', () => {
		const { unlockAttempt, tryLuck, isAttemptUsed } = useDepositStore.getState();

		unlockAttempt('first');
		tryLuck();

		expect(isAttemptUsed('first')).toBe(true);

		unlockAttempt('first');
		const secondTry = tryLuck();
		expect(secondTry).toBe(false);
	});

	test('should calculate win probability ~5%', () => {
		const { unlockAttempt, tryLuck } = useDepositStore.getState();

		let wins = 0;
		for (let i = 0; i < 1000; i++) {
			localStorage.removeItem('luck_attempt_used_first');
			localStorage.removeItem('luck_attempt_used_second');
			localStorage.removeItem('luck_attempt_used_third');

			unlockAttempt('first');
			unlockAttempt('second');
			unlockAttempt('third');

			if (tryLuck()) wins++;
		}

		const winRate = wins / 1000;
		expect(winRate).toBeGreaterThanOrEqual(0.04);
		expect(winRate).toBeLessThanOrEqual(0.07);
	});
});
