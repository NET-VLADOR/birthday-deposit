type HeaderProps = {
	role: 'admin' | 'guest';
	onLogout: () => void;
};

export default function Header({ role, onLogout }: HeaderProps) {
	return (
		<header className="flex justify-between items-center mb-6 bg-ctp-surface0 p-3 rounded-lg border border-ctp-overlay0/20">
			<div>
				<h1 className="text-xl font-bold text-ctp-rosewater">🎉 День Рождения</h1>
				<p className="text-ctp-subtext0 text-sm">
					Роль: <span className="font-medium">{role === 'admin' ? 'Админ' : 'Гость'}</span>
				</p>
			</div>
			<button onClick={onLogout} className="bg-ctp-overlay1 hover:bg-ctp-overlay1/80 text-ctp-text text-sm px-3 py-1 rounded transition">
				Выход
			</button>
		</header>
	);
}
