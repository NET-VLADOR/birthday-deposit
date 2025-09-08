import React, { useState } from 'react';
import { PromoCode } from '../store/useDepositStore';

type PromoAdminSectionProps = {
	promos: PromoCode[];
	getRandomPromo: () => PromoCode | null;
	issuePromo: (id: string) => PromoCode | null;
	showNotification: (message: string, type?: 'success' | 'error') => void;
};

const PromoAdminSection = ({ promos, getRandomPromo, issuePromo, showNotification }: PromoAdminSectionProps) => {
	const [lastGiven, setLastGiven] = useState<PromoCode | null>(null);

	const handleGiveRandom = () => {
		const promo = getRandomPromo();
		if (!promo) {
			showNotification('❌ Нет доступных промокодов', 'error');
			return;
		}
		const issued = issuePromo(promo.id);
		if (issued) {
			setLastGiven(issued);
			showNotification(`🎉 Выдан: ${issued.code} — ${issued.benefit.description}`);
		}
	};

	const handleIssueManually = (id: string) => {
		const issued = issuePromo(id);
		if (issued) {
			showNotification(`✅ Выдан: ${issued.code} — ${issued.benefit.description}`);
		} else {
			showNotification('❌ Промокод уже использован', 'error');
		}
	};

	return (
		<div className="mt-6 p-4 bg-ctp-surface0 rounded-lg border border-ctp-overlay0/20">
			<h3 className="text-lg font-semibold text-ctp-text mb-3">🎟️ Промокоды</h3>

			<button
				onClick={handleGiveRandom}
				disabled={promos.filter((p) => !p.used).length === 0}
				className="mb-4 bg-ctp-peach hover:bg-ctp-peach/90 text-ctp-base px-5 py-2 rounded font-medium transition disabled:opacity-50">
				🎲 Выдать случайный
			</button>

			{lastGiven && (
				<button
					onClick={() => {
						navigator.clipboard.writeText(lastGiven.code).then(
							() => showNotification(`✅ Промокод "${lastGiven.code}" скопирован!`, 'success'),
							() => showNotification('❌ Не удалось скопировать', 'error')
						);
					}}
					className="mb-4 p-3 bg-ctp-yellow/20 border border-ctp-yellow/50 rounded text-ctp-yellow text-sm text-left w-full hover:bg-ctp-yellow/30 transition cursor-pointer"
					aria-label={`Скопировать промокод ${lastGiven.code}`}>
					Выдан: <strong>{lastGiven.code}</strong> — {lastGiven.benefit.description}
				</button>
			)}

			<div className="space-y-2">
				<h4 className="text-sm font-medium text-ctp-subtext0">Все промокоды:</h4>
				{promos.map((promo) => (
					<div
						key={promo.id}
						className={`p-2 rounded flex justify-between items-center text-sm ${
							promo.used ? 'bg-ctp-surface1 text-ctp-subtext0 line-through' : 'bg-ctp-surface2 text-ctp-text'
						}`}>
						<span>
							<strong>{promo.code}</strong> — {promo.benefit.description}
						</span>
						{!promo.used && (
							<button onClick={() => handleIssueManually(promo.id)} className="text-ctp-red hover:text-ctp-red/80 text-xs">
								Выдать
							</button>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default React.memo(PromoAdminSection);
