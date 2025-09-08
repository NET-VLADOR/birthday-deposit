type NotificationToastProps = {
	show: boolean;
	message: string;
	type: 'success' | 'error';
};

export default function NotificationToast({ show, message, type }: NotificationToastProps) {
	if (!show) return null;

	return (
		<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-notification">
			<div
				className={`px-6 py-3 rounded-lg shadow-xl border-2 font-medium
          ${type === 'success' ? 'bg-ctp-green/20 border-ctp-green text-ctp-green' : 'bg-ctp-red/20 border-ctp-red text-ctp-red'}
          backdrop-blur-sm
        `}>
				{message}
			</div>
		</div>
	);
}
