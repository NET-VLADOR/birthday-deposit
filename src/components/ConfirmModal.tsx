type ConfirmModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm }: ConfirmModalProps) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-ctp-crust flex items-center justify-center z-50 p-4">
			<div className="bg-ctp-surface0 p-6 rounded-lg max-w-sm w-full border border-ctp-overlay0/30 shadow-2xl">
				<h3 className="text-lg font-semibold text-ctp-text mb-4">Подтвердите сброс</h3>
				<p className="text-ctp-subtext0 mb-6">Вы уверены? Это действие нельзя отменить.</p>
				<div className="flex gap-3 justify-end">
					<button
						onClick={onClose}
						className="bg-ctp-overlay1 hover:bg-ctp-overlay1/80 text-ctp-text px-4 py-1.5 rounded text-sm transition">
						Отмена
					</button>
					<button
						onClick={onConfirm}
						className="bg-ctp-red hover:bg-ctp-red/90 text-ctp-base px-4 py-1.5 rounded text-sm font-medium transition-all duration-200">
						Да, сбросить
					</button>
				</div>
			</div>
		</div>
	);
};
