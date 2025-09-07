import { useDepositStore, menuItems } from './store/useDepositStore';
import { useState } from 'react';

export default function App() {
	const { balance, orders, beers, addBeer, removeBeer, addToBalance, addItem, removeItem, getTotalSpent, reset, getBeersByPrice, setBalance } =
		useDepositStore();

	const [replenishAmount, setReplenishAmount] = useState('');
	const [beerPrice, setBeerPrice] = useState('300');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [importString, setImportString] = useState('');
	const [notification, setNotification] = useState({
		show: false,
		message: '',
		type: 'success'
	});

	const beerCount = beers.length;
	const totalItems = Object.values(orders).reduce((a, b) => a + b, 0) + beerCount;

	const beerPriceNum = (() => {
		const n = parseInt(beerPrice);
		return isNaN(n) ? 0 : n;
	})();

	const isBeerDisabled = beerPrice === '' || beerPriceNum <= 0 || beerPriceNum > balance;
	const missingAmount = beerPriceNum > balance ? beerPriceNum - balance : 0;

	const handleReplenish = () => {
		const amount = parseInt(replenishAmount);
		if (amount > 0) {
			addToBalance(amount);
			setReplenishAmount('');
		}
	};

	const handleAddBeer = () => {
		const price = parseInt(beerPrice);
		if (isNaN(price) || price <= 0 || price > balance) return;
		addBeer(price);
		setBeerPrice('300');
	};

	const balanceColor = balance >= 6000 ? 'text-ctp-green' : balance >= 3000 ? 'text-ctp-yellow' : 'text-ctp-red';

	const showNotification = (message, type = 'success') => {
		setNotification({ show: false, message: '', type });
		setTimeout(() => {
			setNotification({ show: true, message, type });
			setTimeout(() => {
				setNotification((prev) => ({ ...prev, show: false }));
			}, 3000);
		}, 10);
	};

	const exportData = () => {
		const data = { balance, orders, beers };
		const jsonString = JSON.stringify(data);
		const encoded = btoa(unescape(encodeURIComponent(jsonString)));
		navigator.clipboard.writeText(encoded).then(
			() => showNotification('✅ Данные скопированы! Отправь их другу.'),
			() => showNotification('❌ Не удалось скопировать. Попробуй вручную.', 'error')
		);
	};

	const importData = () => {
		if (!importString.trim()) {
			showNotification('⚠️ Строка пуста', 'error');
			return;
		}

		try {
			const decoded = decodeURIComponent(escape(atob(importString.trim())));
			const data = JSON.parse(decoded);

			reset();

			Object.keys(data.orders || {}).forEach((id) => {
				const count = data.orders[id];
				for (let i = 0; i < count; i++) {
					addItem(id);
				}
			});

			data.beers?.forEach((price) => addBeer(price));

			setBalance(data.balance);

			setImportString('');
			showNotification('🎉 Данные успешно восстановлены!');
		} catch {
			showNotification('❌ Ошибка: неверный формат данных. Проверь строку.', 'error');
		}
	};

	return (
		<div className="min-h-screen bg-ctp-base text-ctp-text px-4 py-6 max-w-2xl mx-auto">
			{/* === Notification Toast === */}
			{notification.show && (
				<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-notification">
					<div
						className={`px-6 py-3 rounded-lg shadow-xl border-2 font-medium
              ${notification.type === 'success' ? 'bg-ctp-green/20 border-ctp-green text-ctp-green' : 'bg-ctp-red/20 border-ctp-red text-ctp-red'}
              backdrop-blur-sm
            `}>
						{notification.message}
					</div>
				</div>
			)}

			<header className="text-center mb-6">
				<h1 className="text-2xl md:text-3xl font-bold text-ctp-rosewater mb-2">🎉 День Рождения!</h1>
				<p className="text-ctp-subtext0">Управляй депозитом: 15 000 ₽ (и пополняй!)</p>
			</header>

			{/* Balance */}
			<div className="bg-ctp-surface0 p-4 rounded-lg mb-6 shadow-lg border border-ctp-overlay0/20">
				<h2 className="text-lg font-semibold text-ctp-text mb-2">Баланс</h2>
				<p className={`text-3xl font-bold ${balanceColor} transition-colors duration-300`}>{balance.toLocaleString()} ₽</p>
				<div className="mt-4 flex gap-2 flex-wrap">
					<input
						type="number"
						placeholder="Сумма"
						value={replenishAmount}
						onChange={(e) => setReplenishAmount(e.target.value)}
						className="bg-ctp-surface1 text-ctp-text px-3 py-2 rounded flex-1 min-w-0 border border-ctp-overlay0/30 focus:outline-none focus:ring-2 focus:ring-ctp-blue/50"
					/>
					<button
						onClick={handleReplenish}
						className="bg-ctp-mantle hover:bg-ctp-mantle/90 hover:text-ctp-rosewater text-ctp-text px-4 py-2 rounded font-medium transition-all duration-200 transform hover:scale-105 shadow-md border border-ctp-overlay0/30">
						Пополнить
					</button>
				</div>
			</div>

			{/* Beer Section */}
			<div className="bg-ctp-surface0 p-4 rounded-lg mb-6 shadow-lg border border-ctp-overlay0/20">
				<h2 className="text-lg font-semibold text-ctp-text mb-3">🍺 Пиво</h2>
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
						: beerPriceNum > balance
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
						disabled={beerCount === 0}
						className="bg-ctp-mantle hover:bg-ctp-mantle/90 hover:text-ctp-rosewater text-ctp-text px-4 py-2 rounded font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow">
						-1
					</button>
				</div>

				{beerPriceNum <= 0 && beerPrice !== '' && <p className="text-ctp-red text-sm mb-2 animate-pulse">⚠️ Цена должна быть больше 0</p>}
				{beerPriceNum > balance && beerPriceNum > 0 && (
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
					<p className="text-ctp-subtext0">Пока нет пива</p>
				)}
			</div>

			{/* Menu Grid */}
			<h2 className="text-xl font-semibold mb-4 text-ctp-text">Меню</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
				{menuItems.map((item) => (
					<div
						key={item.id}
						className="bg-ctp-surface1 p-3 rounded flex justify-between items-center hover:bg-ctp-surface2 transition-colors duration-200 border border-ctp-overlay0/20">
						<div>
							<p className="font-medium text-ctp-text flex items-center gap-2">
								{item.name.includes('Burger') && '🍔 '}
								{item.name.includes('Tacos') && '🌮 '}
								{item.name.includes('Картофель') && '🍟 '}
								{item.name.includes('Крылья') && '🍗 '}
								{item.name.includes('Cheese') && '🧀 '}
								{item.name === 'Соус "Ticket to Hell"' && '🌶️ '}
								{item.name}
							</p>
							<p className="text-sm text-ctp-subtext0">{item.price} ₽</p>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => removeItem(item.id)}
								disabled={!orders[item.id]}
								className="bg-ctp-mantle hover:bg-ctp-mantle/90 hover:text-ctp-rosewater text-ctp-text w-8 h-8 rounded flex items-center justify-center text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
								−
							</button>
							<span className="w-6 text-center text-ctp-text font-medium">{orders[item.id] || 0}</span>
							<button
								onClick={() => addItem(item.id)}
								disabled={balance < item.price}
								className="bg-ctp-mantle hover:bg-ctp-mantle/90 hover:text-ctp-rosewater text-ctp-text w-8 h-8 rounded flex items-center justify-center text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
								+
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Summary */}
			<div className="bg-ctp-surface0 p-4 rounded-lg mb-6 shadow border border-ctp-overlay0/20">
				<h2 className="text-lg font-semibold text-ctp-text mb-2">Итого</h2>
				<p className="text-ctp-subtext0">Позиций: {totalItems}</p>
				<p className="text-ctp-subtext0">Потрачено: {getTotalSpent().toLocaleString()} ₽</p>
			</div>

			{/* Export / Import */}
			<div className="mt-8 p-4 bg-ctp-surface0 rounded-lg border border-ctp-overlay0/20">
				<h3 className="text-lg font-semibold text-ctp-text mb-3">🔐 Перенос данных</h3>

				<div className="mb-4">
					<button onClick={exportData} className="bg-ctp-blue hover:bg-ctp-blue/90 text-ctp-base px-5 py-2 rounded font-medium transition">
						🔐 Экспортировать данные
					</button>
					<p className="text-ctp-subtext0 text-xs mt-1">Скопирует зашифрованную строку в буфер. Отправь её другу.</p>
				</div>

				<div>
					<label className="block text-ctp-text text-sm font-medium mb-1">🔓 Восстановить из строки:</label>
					<div className="flex gap-2 flex-wrap">
						<input
							type="text"
							placeholder="Вставь строку сюда"
							value={importString}
							onChange={(e) => setImportString(e.target.value)}
							className="bg-ctp-surface1 text-ctp-text px-3 py-2 rounded flex-1 min-w-0 border border-ctp-overlay0/30 focus:outline-none focus:ring-2 focus:ring-ctp-blue/50"
						/>
						<button
							onClick={importData}
							disabled={!importString.trim()}
							className="bg-ctp-mauve hover:bg-ctp-mauve/90 text-ctp-base px-4 py-2 rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
							Восстановить
						</button>
					</div>
					<p className="text-ctp-subtext0 text-xs mt-1">Вставь строку, полученную от друга, и нажми "Восстановить".</p>
				</div>
			</div>

			{/* Reset Button */}
			<div className="text-center mt-6">
				<button
					onClick={() => setConfirmOpen(true)}
					className="bg-ctp-mantle hover:bg-ctp-mantle/90 hover:text-ctp-rosewater text-ctp-text px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg border border-ctp-overlay0/30">
					🗑️ Сбросить всё
				</button>
			</div>

			{/* Confirmation Modal */}
			{confirmOpen && (
				<div className="fixed inset-0 bg-ctp-crust flex items-center justify-center z-50 p-4">
					<div className="bg-ctp-surface0 p-6 rounded-lg max-w-sm w-full border border-ctp-overlay0/30 shadow-2xl">
						<h3 className="text-lg font-semibold text-ctp-text mb-4">Подтвердите сброс</h3>
						<p className="text-ctp-subtext0 mb-6">Вы уверены, что хотите сбросить весь депозит и заказы? Это действие нельзя отменить.</p>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setConfirmOpen(false)}
								className="bg-ctp-overlay1 hover:bg-ctp-overlay1/80 text-ctp-text px-4 py-1.5 rounded text-sm transition">
								Отмена
							</button>
							<button
								onClick={() => {
									reset();
									setConfirmOpen(false);
								}}
								className="bg-ctp-red hover:bg-ctp-red/90 text-ctp-base px-4 py-1.5 rounded text-sm font-medium transition-all duration-200">
								Да, сбросить
							</button>
						</div>
					</div>
				</div>
			)}

			<footer className="text-center mt-8 text-sm text-ctp-overlay1">Все данные сохраняются локально.</footer>
		</div>
	);
}
