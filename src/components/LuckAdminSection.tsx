import React from 'react';

type LuckAdminSectionProps = {
	unlockAttempt: (attempt: 'first' | 'second' | 'third') => void;
	attempts: { first: boolean; second: boolean; third: boolean };
	showNotification: (message: string, type?: 'success' | 'error') => void;
};

const LuckAdminSection = ({ unlockAttempt, attempts, showNotification }: LuckAdminSectionProps) => {
	const handleUnlock = (attempt: 'first' | 'second' | 'third', label: string) => {
		if (attempts[attempt]) {
			showNotification(`⚠️ ${label} попытка уже разблокирована`, 'error');
			return;
		}
		unlockAttempt(attempt);
		showNotification(`✅ Разблокирована ${label} попытка для всех гостей!`, 'success');
	};

	return (
		<div className="mt-6 p-4 bg-ctp-surface0 rounded-lg border border-ctp-overlay0/20">
			<h3 className="text-lg font-semibold text-ctp-text mb-3">🍀 Разблокировать попытки</h3>
			<div className="space-y-2">
				<button
					onClick={() => handleUnlock('first', 'первая')}
					disabled={attempts.first}
					className="w-full text-left px-4 py-2 bg-ctp-surface1 hover:bg-ctp-surface2 rounded text-ctp-text disabled:opacity-50">
					{attempts.first ? '✅ Первая попытка активна' : '🔓 Разблокировать первую попытку'}
				</button>
				<button
					onClick={() => handleUnlock('second', 'вторая')}
					disabled={attempts.second}
					className="w-full text-left px-4 py-2 bg-ctp-surface1 hover:bg-ctp-surface2 rounded text-ctp-text disabled:opacity-50">
					{attempts.second ? '✅ Вторая попытка активна' : '🔓 Разблокировать вторую попытку'}
				</button>
				<button
					onClick={() => handleUnlock('third', 'третья')}
					disabled={attempts.third}
					className="w-full text-left px-4 py-2 bg-ctp-surface1 hover:bg-ctp-surface2 rounded text-ctp-text disabled:opacity-50">
					{attempts.third ? '✅ Третья попытка активна' : '🔓 Разблокировать третью попытку'}
				</button>
			</div>
			<p className="text-ctp-subtext0 text-xs mt-2">После разблокировки — отправьте новую строку синхронизации гостям.</p>
		</div>
	);
};

export default React.memo(LuckAdminSection);
