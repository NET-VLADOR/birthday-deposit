import { useState } from 'react';

type BeerSectionProps = {
	beers: number[];
	getBeersByPrice: () => { price: number; count: number }[];
	addBeer: (price: number) => void;
	removeBeer: () => void;
	calculatedBalance: number;
	role: 'admin' | 'guest';
	showNotification: (message: string, type?: 'success' | 'error') => void;
};

export default function BeerSection({ beers, getBeersByPrice, addBeer, removeBeer, calculatedBalance, role, showNotification }: BeerSectionProps) {
	const [beerPrice, setBeerPrice] = useState('300');

	const beerPriceNum = (() => {
		const n = parseInt(beerPrice);
		return isNaN(n) ? 0 : n;
	})();

	const isBeerDisabled = beerPrice === '' || beerPriceNum <= 0 || beerPriceNum > calculatedBalance;
	const missingAmount = beerPriceNum > calculatedBalance ? beerPriceNum - calculatedBalance : 0;

	const handleAddBeer = () => {
		const price = parseInt(beerPrice);
		if (isNaN(price) || price <= 0 || price > calculatedBalance) {
			showNotification('❌ Недостаточно средств или неверная цена', 'error');
			return;
		}
		addBeer(price);
		setBeerPrice('300');
	};

	return (
		<div className="bg-ctp-surface0 p-4 rounded-lg mb-6 shadow-lg border border-ctp-overlay0/20">
			<h2 className="text-lg font-semibold text-ctp-text mb-3">🍺 Пиво</h2>

			{role === 'admin' && (
				<div className="flex gap-2 items-center flex-wrap mb-3">
					<input
						type="number"
						placeholder="Цена"
						value={beerPrice}
						onChange={(e) => setBeerPrice(e.target.value)}
						className={`bg-ctp-surface1 px-3 py-2 rounded w-32 border focus:outline-none focus:ring-2
              ${
					beerPriceNum <= 0 && beerPrice !== ''
						? 'border-ctp-red/60 text-ctp-red bg-ctp-surface0/80'
						: beerPriceNum > calculatedBalance
						? 'border-ctp-red/60 text-ctp-red bg-ctp-surface0/80'
						: 'border-ctp-overlay0/30 text-ctp-text bg-ctp-surface1'
				}
            `}
					/>
					<button
						onClick={handleAddBeer}
						disabled={isBeerDisabled}
						className="bg-ctp-mantle hover:bg-ctp-mantle/90 hover:text-ctp-rosewater text-ctp-text px-4 py-2 rounded font-medium transition-all duration-200 transform hover:scale-105 shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
						+1 Пиво
					</button>
					<button
						onClick={removeBeer}
						disabled={beers.length === 0}
						className="bg-ctp-mantle hover:bg-ctp-mantle/90 hover:text-ctp-rosewater text-ctp-text px-4 py-2 rounded font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow">
						-1
					</button>
				</div>
			)}
			{role === 'admin' && beerPriceNum <= 0 && beerPrice !== '' && (
				<p className="text-ctp-red text-sm mb-2 animate-pulse">⚠️ Цена должна быть больше 0</p>
			)}
			{role === 'admin' && beerPriceNum > calculatedBalance && beerPriceNum > 0 && (
				<p className="text-ctp-red text-sm mb-2 animate-pulse">⚠️ Не хватает {missingAmount.toLocaleString()} ₽</p>
			)}

			{getBeersByPrice().length > 0 ? (
				<div className="space-y-1">
					{getBeersByPrice().map(({ price, count }) => (
						<p key={price} className="text-ctp-subtext0 flex items-center gap-1">
							🍺 <span className="font-medium text-ctp-text">{price} ₽</span> ×{count}
						</p>
					))}
				</div>
			) : (
				<p className="text-ctp-subtext0">Пока нет пива😢</p>
			)}
		</div>
	);
}
