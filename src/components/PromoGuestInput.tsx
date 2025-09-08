import React, { useState } from 'react';
import { PromoCode } from '../store/useDepositStore';

type PromoGuestInputProps = {
	applyPromo: (code: string) => boolean;
	promos: PromoCode[];
	showNotification: (message: string, type?: 'success' | 'error') => void;
};

const PromoGuestInput = ({ applyPromo, promos, showNotification }: PromoGuestInputProps) => {
	const [promoCode, setPromoCode] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const code = promoCode.trim().toUpperCase();
		if (!code) {
			showNotification('⚠️ Введите промокод', 'error');
			return;
		}

		const success = applyPromo(code);
		if (success) {
			const promo = promos.find((p) => p.code === code);
			const description = promo?.benefit.description || 'Приз активирован!';
			showNotification(`🎉 ${description}`, 'success');
			setPromoCode('');
		} else {
			showNotification('❌ Промокод не найден или уже использован', 'error');
		}
	};

	return (
		<div className="mt-6 p-4 bg-ctp-surface0 rounded-lg border border-ctp-overlay0/20">
			<h3 className="text-lg font-semibold text-ctp-text mb-3">🎟️ У вас есть промокод?</h3>
			<form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
				<input
					type="text"
					placeholder="Введите промокод"
					value={promoCode}
					onChange={(e) => setPromoCode(e.target.value)}
					className="bg-ctp-surface1 text-ctp-text px-3 py-2 rounded flex-1 min-w-0 border border-ctp-overlay0/30 focus:outline-none focus:ring-2 focus:ring-ctp-peach/50"
				/>
				<button
					type="submit"
					disabled={!promoCode.trim()}
					className="bg-ctp-peach hover:bg-ctp-peach/90 text-ctp-base px-4 py-2 rounded font-medium transition disabled:opacity-50">
					Активировать
				</button>
			</form>
			<p className="text-ctp-subtext0 text-xs mt-1">Промокод должен быть выдан именинником.</p>
		</div>
	);
};

export default React.memo(PromoGuestInput);
