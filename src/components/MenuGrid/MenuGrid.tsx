import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { MenuItem, menuItems } from '../../store/useDepositStore';

type MenuGridProps = {
	orders: Record<string, number>;
	calculatedBalance: number;
	role: 'admin' | 'guest';
	addItem: (id: string) => void;
	removeItem: (id: string) => void;
};

export default function MenuGrid({ orders, calculatedBalance, role, addItem, removeItem }: MenuGridProps) {
	const [activeTab, setActiveTab] = useState<'main' | 'snacks'>('main');

	const mainItems = menuItems.filter((item) => !item.category || item.category !== 'snack');
	const snackItems = menuItems.filter((item) => item.category === 'snack');

	const handlers = useSwipeable({
		onSwipedLeft: () => setActiveTab('snacks'),
		onSwipedRight: () => setActiveTab('main')
	});

	const renderMenuItem = (item: MenuItem) => (
		<div
			key={item.id}
			className="bg-ctp-surface1 p-3 rounded flex justify-between items-center hover:bg-ctp-surface2 transition-colors duration-200 border border-ctp-overlay0/20">
			<div>
				<p className="font-medium text-ctp-text flex items-center gap-2">
					{item.name.includes('Burger') && '🍔 '}
					{item.name.includes('Tacos') && '🌮 '}
					{item.name.includes('Chicken') && '🐔 '}
					{item.name.includes('Pork') && '🐷 '}
					{item.name.includes('Картофель') && '🍟 '}
					{item.name.includes('Крылья') && '🍗 '}
					{item.name.includes('Cheese') && '🧀 '}
					{item.name.includes('Соус') && '🫙 '}
					{item.name === 'Соус "Ticket to Hell"' && '🌶️ '}
					{item.name.includes('Арахис') && '🥜 '}
					{item.name.includes('Чипсы') && '🧂 '}
					{item.name.includes('Попкорн') && '🍿 '}
					{item.name.includes('Яйцо') && '🥚 '}
					{item.name.includes('Джерки') && '🥩 '}
					{item.name.includes('Сыр') && '🧀 '}
					{item.name}
				</p>
				<p className="text-sm text-ctp-subtext0">{item.price} ₽</p>
			</div>

			{role === 'admin' ? (
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
						disabled={calculatedBalance < item.price}
						className="bg-ctp-mantle hover:bg-ctp-mantle/90 hover:text-ctp-rosewater text-ctp-text w-8 h-8 rounded flex items-center justify-center text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
						+
					</button>
				</div>
			) : (
				<span className="text-ctp-subtext0 text-sm">×{orders[item.id] || 0}</span>
			)}
		</div>
	);

	return (
		<>
			<h2 className="text-xl font-semibold mb-4 text-ctp-text">Меню</h2>

			<div className="flex mb-4 border-b border-ctp-overlay0/30">
				<button
					onClick={() => setActiveTab('main')}
					className={`px-4 py-2 font-medium transition ${
						activeTab === 'main' ? 'text-ctp-blue border-b-2 border-ctp-blue' : 'text-ctp-subtext0 hover:text-ctp-text'
					}`}>
					Основное
				</button>
				<button
					onClick={() => setActiveTab('snacks')}
					className={`px-4 py-2 font-medium transition ${
						activeTab === 'snacks' ? 'text-ctp-blue border-b-2 border-ctp-blue' : 'text-ctp-subtext0 hover:text-ctp-text'
					}`}>
					Закуски
				</button>
			</div>

			<div {...handlers} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
				{(activeTab === 'main' ? mainItems : snackItems).map(renderMenuItem)}
			</div>
		</>
	);
}
