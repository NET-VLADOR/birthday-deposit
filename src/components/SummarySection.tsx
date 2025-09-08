type SummarySectionProps = {
	totalItems: number;
	totalSpent: number;
	replenishments: number[];
	role: 'admin' | 'guest';
	totalPromoSpent: number;
};

export default function SummarySection({ totalPromoSpent, totalItems, totalSpent, replenishments, role }: SummarySectionProps) {
	return (
		<div className="bg-ctp-surface0 p-4 rounded-lg mb-6 shadow border border-ctp-overlay0/20">
			<h2 className="text-lg font-semibold text-ctp-text mb-2">Итого</h2>
			<p className="text-ctp-subtext0">Позиций: {totalItems}</p>
			<p className="text-ctp-subtext0">Потрачено: {totalSpent.toLocaleString()} ₽</p>
			{role === 'admin' && <p className="text-ctp-subtext0">Пополнено: {replenishments.reduce((a, b) => a + b, 0).toLocaleString()} ₽</p>}
			{role === 'admin' && <p className="text-ctp-subtext0">Подарки по промокодам: {totalPromoSpent.toLocaleString()} ₽</p>}
		</div>
	);
}
