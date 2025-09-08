import { useState } from 'react';

type ReplenishSectionProps = {
	onReplenish: (amount: number) => void;
	showNotification: (message: string, type?: 'success' | 'error') => void;
};

export default function ReplenishSection({ onReplenish, showNotification }: ReplenishSectionProps) {
	const [replenishAmount, setReplenishAmount] = useState('');

	const handleReplenish = () => {
		const amount = parseInt(replenishAmount);
		if (amount > 0) {
			onReplenish(amount);
			setReplenishAmount('');
			showNotification('✅ Баланс пополнен');
		}
	};

	return (
		<div className="bg-ctp-surface0 p-4 rounded-lg mb-6 shadow-lg border border-ctp-overlay0/20">
			<h2 className="text-lg font-semibold text-ctp-text mb-3">💸 Пополнить баланс</h2>
			<div className="flex gap-2 flex-wrap">
				<input
					type="number"
					placeholder="Сумма"
					value={replenishAmount}
					onChange={(e) => setReplenishAmount(e.target.value)}
					className="bg-ctp-surface1 text-ctp-text px-3 py-2 rounded flex-1 min-w-0 border border-ctp-overlay0/30 focus:outline-none focus:ring-2 focus:ring-ctp-blue/50"
				/>
				<button
					onClick={handleReplenish}
					className="bg-ctp-mantle hover:bg-ctp-mantle/90 hover:text-ctp-rosewater text-ctp-text px-4 py-2 rounded font-medium transition-all duration-200 transform hover:scale-105 shadow-md">
					Пополнить
				</button>
			</div>
		</div>
	);
}
