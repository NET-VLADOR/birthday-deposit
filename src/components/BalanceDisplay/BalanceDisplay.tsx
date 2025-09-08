type BalanceDisplayProps = {
	balance: number;
};

export default function BalanceDisplay({ balance }: BalanceDisplayProps) {
	const balanceColor = balance >= 6000 ? 'text-ctp-green' : balance >= 3000 ? 'text-ctp-yellow' : 'text-ctp-red';

	return (
		<div className="bg-ctp-surface0 p-4 rounded-lg mb-6 shadow-lg border border-ctp-overlay0/20">
			<h2 className="text-lg font-semibold text-ctp-text mb-2">Баланс</h2>
			<p className={`text-3xl font-bold ${balanceColor} transition-colors duration-300`}>{balance.toLocaleString()} ₽</p>
		</div>
	);
}
