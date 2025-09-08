import React from 'react';
import { useDepositStore } from '../store/useDepositStore';

type LuckSectionProps = {
	hasAttempt: (attempt: 'first' | 'second' | 'third') => boolean;
	tryLuck: () => boolean;
	showNotification: (message: string, type?: 'success' | 'error') => void;
};

const LuckSection = ({ hasAttempt, tryLuck, showNotification }: LuckSectionProps) => {
	const handleTry = () => {
		const { isAttemptUsed } = useDepositStore.getState();

		const canTry = ['first', 'second', 'third'].some(
			(key) => hasAttempt(key as 'first' | 'second' | 'third') && !isAttemptUsed(key as 'first' | 'second' | 'third')
		);

		if (!canTry) {
			showNotification('❌ Нет активных попыток. Дождитесь, пока именинник разблокирует!', 'error');
			return;
		}

		const won = tryLuck();
		if (won) {
			showNotification('🎉 ПОЗДРАВЛЯЕМ! Ты выиграл пиво! 🍺', 'success');

			document.body.classList.add('pulse-active');
			setTimeout(() => {
				document.body.classList.remove('pulse-active');
			}, 15000);
		} else {
			showNotification('😔 Не повезло... Попробуй ещё!', 'error');
		}
	};

	const { isAttemptUsed } = useDepositStore.getState();

	const activeAttempts = [
		{ key: 'first', active: hasAttempt('first') },
		{ key: 'second', active: hasAttempt('second') },
		{ key: 'third', active: hasAttempt('third') }
	].filter((item) => item.active && !isAttemptUsed(item.key as 'first' | 'second' | 'third')).length;

	let attemptsText = '';
	if (activeAttempts === 0) {
		attemptsText = 'нет активных попыток';
	} else if (activeAttempts === 1) {
		attemptsText = '1 активная попытка';
	} else {
		attemptsText = `${activeAttempts} активные попытки`;
	}

	return (
		<div className="mt-6 p-4 bg-ctp-surface0 rounded-lg border border-ctp-overlay0/20">
			<h3 className="text-lg font-semibold text-ctp-text mb-3">🍀 Испытай удачу!</h3>
			<p className="text-ctp-subtext0 text-sm mb-3">У тебя {attemptsText}. Шанс выиграть пиво — 5%.</p>
			<button
				onClick={handleTry}
				disabled={activeAttempts === 0}
				className="bg-ctp-green hover:bg-ctp-green/90 text-ctp-base px-5 py-2 rounded font-medium transition disabled:opacity-50">
				🎲 Попытать счастье
			</button>
		</div>
	);
};

export default React.memo(LuckSection);
