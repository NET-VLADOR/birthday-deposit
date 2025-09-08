import { useDepositStore } from './store/useDepositStore';
import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen/LoginScreen';
import NotificationToast from './components/NotificationToast';
import Header from './components/Header';
import BalanceDisplay from './components/BalanceDisplay/BalanceDisplay';
import ReplenishSection from './components/ReplenishSection/ReplenishSection';
import BeerSection from './components/BeerSection/BeerSection';
import MenuGrid from './components/MenuGrid/MenuGrid';
import SummarySection from './components/SummarySection';
import DataPanel from './components/DataPanel';
import ResetButton from './components/ResetButton';
import Footer from './components/Footer';
import { ConfirmModal } from './components/ConfirmModal';

type NotificationType = 'success' | 'error';
type Role = 'admin' | 'guest' | null;

export default function App() {
	const {
		orders,
		beers,
		replenishments,
		addReplenishment,
		addBeer,
		removeBeer,
		addItem,
		removeItem,
		getTotalSpent,
		getCalculatedBalance,
		getBeersByPrice,
		reset
	} = useDepositStore();

	const [role, setRole] = useState<Role>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [notification, setNotification] = useState<{
		show: boolean;
		message: string;
		type: NotificationType;
	}>({
		show: false,
		message: '',
		type: 'success'
	});

	useEffect(() => {
		const savedRole = localStorage.getItem('userRole');
		if (savedRole === 'admin' || savedRole === 'guest') {
			setRole(savedRole as Role);
		}
	}, []);

	const showNotification = (message: string, type: NotificationType = 'success') => {
		setNotification({ show: false, message: '', type });
		setTimeout(() => {
			setNotification({ show: true, message, type });
			setTimeout(() => {
				setNotification((prev) => ({ ...prev, show: false }));
			}, 3000);
		}, 10);
	};

	const handleLogin = (userRole: 'admin' | 'guest') => {
		setRole(userRole);
		localStorage.setItem('userRole', userRole);
	};

	const handleLogout = () => {
		localStorage.removeItem('userRole');
		localStorage.removeItem('deposit-storage');
		setRole(null);
		reset();
	};

	if (role === null) {
		return <LoginScreen onLogin={handleLogin} />;
	}

	const beerCount = beers.length;
	const totalItems = Object.values(orders).reduce((a, b) => a + b, 0) + beerCount;
	const calculatedBalance = getCalculatedBalance();

	const exportData = () => {
		const data = { orders, beers, replenishments };
		const jsonString = JSON.stringify(data);
		const encoded = btoa(unescape(encodeURIComponent(jsonString)));
		navigator.clipboard.writeText(encoded).then(
			() => showNotification('✅ Данные скопированы!'),
			() => showNotification('❌ Не удалось скопировать.', 'error')
		);
	};

	const importData = (importString: string) => {
		try {
			const decoded = decodeURIComponent(escape(atob(importString.trim())));
			const data = JSON.parse(decoded);

			reset();

			data.replenishments?.forEach((amount: number) => addReplenishment(amount));
			Object.keys(data.orders || {}).forEach((id) => {
				const count = data.orders[id];
				for (let i = 0; i < count; i++) {
					addItem(id);
				}
			});
			data.beers?.forEach((price: number) => addBeer(price));

			showNotification('🎉 Данные обновлены!');
		} catch (err) {
			showNotification('❌ Ошибка: неверный формат данных.', 'error');
		}
	};

	return (
		<div className="min-h-screen bg-ctp-base text-ctp-text px-4 py-6 max-w-2xl mx-auto">
			<NotificationToast {...notification} />

			<Header role={role} onLogout={handleLogout} />

			<BalanceDisplay balance={calculatedBalance} />

			{role === 'admin' && <ReplenishSection onReplenish={addReplenishment} showNotification={showNotification} />}

			<BeerSection
				beers={beers}
				getBeersByPrice={getBeersByPrice}
				addBeer={addBeer}
				removeBeer={removeBeer}
				calculatedBalance={calculatedBalance}
				role={role}
				showNotification={showNotification}
			/>

			<MenuGrid orders={orders} calculatedBalance={calculatedBalance} role={role} addItem={addItem} removeItem={removeItem} />

			<SummarySection totalItems={totalItems} totalSpent={getTotalSpent()} replenishments={replenishments} role={role} />

			<DataPanel role={role} exportData={exportData} importData={importData} showNotification={showNotification} />

			{role === 'admin' && (
				<>
					<ResetButton onReset={() => setConfirmOpen(true)} showNotification={showNotification} />
					<ConfirmModal
						isOpen={confirmOpen}
						onClose={() => setConfirmOpen(false)}
						onConfirm={() => {
							reset();
							setConfirmOpen(false);
							showNotification('💥 Данные сброшены');
						}}
					/>
				</>
			)}

			<Footer />
		</div>
	);
}
