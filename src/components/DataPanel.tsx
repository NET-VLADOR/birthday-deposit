import { useState } from 'react';

type DataPanelProps = {
	role: 'admin' | 'guest';
	exportData: () => void;
	importData: (dataString: string) => void;
	showNotification: (message: string, type?: 'success' | 'error') => void;
	syncToCloud: () => Promise<void>;
	syncFromCloud: () => Promise<void>;
};

export default function DataPanel({ role, exportData, importData, showNotification, syncToCloud, syncFromCloud }: DataPanelProps) {
	const [importString, setImportString] = useState('');

	const handleImport = () => {
		if (!importString.trim()) {
			showNotification('⚠️ Строка пуста', 'error');
			return;
		}
		importData(importString);
		setImportString('');
	};

	if (role === 'admin') {
		return (
			<div className="mt-8 p-4 bg-ctp-surface0 rounded-lg border border-ctp-overlay0/20">
				<h3 className="text-lg font-semibold text-ctp-text mb-3">🔐 Админ-панель</h3>

				<div className="mb-4">
					<button onClick={exportData} className="bg-ctp-blue hover:bg-ctp-blue/90 text-ctp-base px-5 py-2 rounded font-medium transition">
						🔐 Экспортировать данные
					</button>
					<p className="text-ctp-subtext0 text-xs mt-1">Скопирует строку для передачи.</p>
				</div>

				<div>
					<label className="block text-ctp-text text-sm font-medium mb-1">📥 Восстановить:</label>
					<div className="flex gap-2 flex-wrap">
						<input
							type="text"
							placeholder="Вставь строку сюда"
							value={importString}
							onChange={(e) => setImportString(e.target.value)}
							className="bg-ctp-surface1 text-ctp-text px-3 py-2 rounded flex-1 min-w-0 border border-ctp-overlay0/30 focus:outline-none focus:ring-2 focus:ring-ctp-blue/50"
						/>
						<button
							onClick={handleImport}
							disabled={!importString.trim()}
							className="bg-ctp-mauve hover:bg-ctp-mauve/90 text-ctp-base px-4 py-2 rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
							Восстановить
						</button>
					</div>
					<p className="text-ctp-subtext0 text-xs mt-1">Вставь строку от другого админа.</p>
				</div>

				<div className="mt-4">
					<h4 className="text-sm font-medium text-ctp-text mb-2">☁️ Облачная синхронизация</h4>
					<div className="flex gap-2 flex-wrap">
						<button
							onClick={() => syncToCloud()}
							className="bg-ctp-blue hover:bg-ctp-blue/90 text-ctp-base px-4 py-2 rounded font-medium transition">
							Сохранить в облако
						</button>
						<button
							onClick={() => syncFromCloud()}
							className="bg-ctp-green hover:bg-ctp-green/90 text-ctp-base px-4 py-2 rounded font-medium transition">
							Загрузить из облака
						</button>
					</div>
					<p className="text-ctp-subtext0 text-xs mt-1">Автоматически синхронизирует всех участников.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mt-8 p-4 bg-ctp-surface0 rounded-lg border border-ctp-overlay0/20">
			<h3 className="text-lg font-semibold text-ctp-text mb-3">📥 Обновить данные</h3>
			<p className="text-ctp-subtext0 text-sm mb-2">Вставьте строку от именинника:</p>
			<div className="flex gap-2 flex-wrap">
				<input
					type="text"
					placeholder="Строка данных"
					value={importString}
					onChange={(e) => setImportString(e.target.value)}
					className="bg-ctp-surface1 text-ctp-text px-3 py-2 rounded flex-1 min-w-0 border border-ctp-overlay0/30 focus:outline-none focus:ring-2 focus:ring-ctp-blue/50"
				/>
				<button
					onClick={handleImport}
					disabled={!importString.trim()}
					className="bg-ctp-mauve hover:bg-ctp-mauve/90 text-ctp-base px-4 py-2 rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
					Обновить
				</button>
			</div>
			<p className="text-ctp-subtext0 text-xs mt-1">Чтобы увидеть актуальный баланс.</p>

			<div className="mt-4">
				<h4 className="text-sm font-medium text-ctp-text mb-2">☁️ Облачная синхронизация</h4>
				<div className="flex gap-2 flex-wrap">
					<button
						onClick={() => syncFromCloud()}
						className="bg-ctp-green hover:bg-ctp-green/90 text-ctp-base px-4 py-2 rounded font-medium transition">
						Загрузить из облака
					</button>
				</div>
				<p className="text-ctp-subtext0 text-xs mt-1">Автоматически синхронизирует всех участников.</p>
			</div>
		</div>
	);
}
