import { useState } from 'react';

type LoginScreenProps = {
	onLogin: (role: 'admin' | 'guest') => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
	const [password, setPassword] = useState('');

	const handleLogin = () => {
		if (password === 'bd120925') {
			onLogin('admin');
		} else {
			onLogin('guest');
		}
		setPassword('');
	};

	return (
		<div className="min-h-screen bg-ctp-base text-ctp-text flex items-center justify-center px-4">
			<div className="bg-ctp-surface0 p-6 rounded-lg shadow-lg max-w-xs w-full border border-ctp-overlay0/20">
				<h1 className="text-xl font-bold text-ctp-rosewater mb-4 text-center">🎉 День Рождения</h1>
				<p className="text-ctp-subtext0 text-sm mb-4">Войдите, чтобы продолжить</p>
				<input
					type="password"
					placeholder="Пароль"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
					className="w-full bg-ctp-surface1 text-ctp-text px-3 py-2 rounded border border-ctp-overlay0/30 focus:outline-none focus:ring-2 focus:ring-ctp-blue/50 mb-3"
				/>
				<button onClick={handleLogin} className="w-full bg-ctp-blue hover:bg-ctp-blue/90 text-ctp-base py-2 rounded font-medium transition">
					Войти
				</button>
			</div>
		</div>
	);
}
