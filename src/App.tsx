import { PromoCode, useDepositStore } from './store/useDepositStore';
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
import PromoGuestInput from './components/PromoGuestInput';
import PromoAdminSection from './components/PromoAdminSection';

type NotificationType = 'success' | 'error';
type Role = 'admin' | 'guest' | null;

export default function App() {
	const {
		orders,
		beers,
		replenishments,
		promos,
		promoTransactions,
		getRandomPromo,
		addPromoTransaction,
		applyPromo,
		addReplenishment,
		issuePromo,
		addBeer,
		removeBeer,
		addItem,
		removeItem,
		getTotalSpent,
		getCalculatedBalance,
		getTotalPromoSpent,
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
		const data = { orders, beers, replenishments, promos, promoTransactions };
		const jsonString = JSON.stringify(data);
		const encoded = btoa(unescape(encodeURIComponent(jsonString)));
		navigator.clipboard.writeText(encoded).then(
			() => showNotification('✅ Данные скопированы!'),
			() => showNotification('❌ Не удалось скопировать.', 'error')
		);
	};

	const importData = (importString: string) => {
		if (!importString.trim()) {
			showNotification('⚠️ Строка пуста', 'error');
			return;
		}

		try {
			const decoded = decodeURIComponent(escape(atob(importString.trim())));
			const data = JSON.parse(decoded);

			if (Array.isArray(data.replenishments)) {
				data.replenishments.forEach((amount: number) => addReplenishment(amount));
			}

			if (data.orders && typeof data.orders === 'object') {
				Object.entries(data.orders).forEach(([id, count]) => {
					const currentCount = orders[id] || 0;
					const importedCount = count as number;
					const diff = importedCount - currentCount;
					if (diff > 0) {
						for (let i = 0; i < diff; i++) {
							addItem(id);
						}
					}
				});
			}

			if (Array.isArray(data.beers)) {
				data.beers.forEach((price: number) => addBeer(price));
			}

			if (Array.isArray(data.promos)) {
				data.promos.forEach((importedPromo: PromoCode) => {
					if (importedPromo.used) {
						const existingPromo = promos.find((p) => p.id === importedPromo.id);
						if (existingPromo && !existingPromo.used) {
							issuePromo(existingPromo.id);
						}
					}
				});
			}

			if (Array.isArray(data.promoTransactions)) {
				const existingAts = new Set(promoTransactions.map((tx) => tx.at));
				data.promoTransactions.forEach((tx: any) => {
					if (!existingAts.has(tx.at)) {
						addPromoTransaction(tx);
					}
				});
			}

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

			<SummarySection
				totalPromoSpent={getTotalPromoSpent()}
				totalItems={totalItems}
				totalSpent={getTotalSpent()}
				replenishments={replenishments}
				role={role}
			/>

			{role === 'guest' && <PromoGuestInput promos={promos} applyPromo={applyPromo} showNotification={showNotification} />}

			{role === 'admin' && (
				<PromoAdminSection issuePromo={issuePromo} promos={promos} getRandomPromo={getRandomPromo} showNotification={showNotification} />
			)}

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
