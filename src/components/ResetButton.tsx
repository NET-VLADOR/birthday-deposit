type ResetButtonProps = {
	onReset: () => void;
	showNotification: (message: string, type?: 'success' | 'error') => void;
};

export default function ResetButton({ onReset, showNotification }: ResetButtonProps) {
	return (
		<div className="text-center mt-6">
			<button
				onClick={onReset}
				className="bg-ctp-mantle hover:bg-ctp-mantle/90 hover:text-ctp-rosewater text-ctp-text px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg border border-ctp-overlay0/30">
				🗑️ Сбросить всё
			</button>
		</div>
	);
}
