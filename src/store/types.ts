export type MenuItem = {
	id: string;
	name: string;
	price: number;
	category?: 'snack';
};

export type PromoCode = {
	id: string;
	code: string;
	benefit: {
		type: 'free_item' | 'free_beer' | 'any_under';
		value: any;
		description: string;
	};
	used: boolean;
};

export const menuItems: MenuItem[] = [
	{ id: 'pate-small', name: 'Pate (маленькая)', price: 350 },
	{ id: 'pate-big', name: 'Pate (большая)', price: 700 },
	{ id: 'crispy-chicken-burger', name: 'Crispy Chicken Burger', price: 550 },
	{ id: 'pulled-pork-burger', name: 'Pulled Pork Burger', price: 550 },
	{ id: 'crispy-chicken-tacos', name: 'Crispy Chicken Tacos', price: 420 },
	{ id: 'pulled-pork-tacos', name: 'Pulled Pork Tacos', price: 420 },
	{ id: 'beef-tacos', name: 'Beef Tacos', price: 450 },
	{ id: 'cheese-tacos', name: 'Cheese Tacos', price: 420 },
	{ id: 'chicken-wings', name: 'Крылья куринные', price: 450 },
	{ id: 'fries', name: 'Картофель фри', price: 220 },
	{ id: 'sauce', name: 'Соус', price: 70 },
	{ id: 'sauce-hell', name: 'Соус "Ticket to Hell"', price: 200 },
	{ id: 'snack-peanuts', name: 'Арахис', price: 100, category: 'snack' },
	{ id: 'snack-chips', name: 'Чипсы', price: 130, category: 'snack' },
	{ id: 'snack-cheese', name: 'Сыр копченый', price: 250, category: 'snack' },
	{ id: 'snack-jerky', name: 'Джерки', price: 390, category: 'snack' },
	{ id: 'snack-popcorn', name: 'Попкорн', price: 100, category: 'snack' },
	{ id: 'snack-egg', name: 'Маринованное яйцо', price: 120, category: 'snack' }
];

export const initialPromos: PromoCode[] = [
	{
		id: 'p1',
		code: 'OSTRO',
		benefit: {
			type: 'free_item',
			value: 'chicken-wings',
			description: '🔥 Бесплатные острые крылья!'
		},
		used: false
	},
	{
		id: 'p2',
		code: 'CHERNOE',
		benefit: {
			type: 'free_beer',
			value: 'black',
			description: '🍺 Бесплатное черное пиво!'
		},
		used: false
	},
	{
		id: 'p3',
		code: 'PODAROK',
		benefit: {
			type: 'any_under',
			value: 500,
			description: '🎁 Любая позиция до 500₽ — бесплатно!'
		},
		used: false
	},
	{
		id: 'p4',
		code: 'TACOLOVE',
		benefit: {
			type: 'free_item',
			value: 'crispy-chicken-tacos',
			description: '🌮 Бесплатные такос!'
		},
		used: false
	},
	{
		id: 'p5',
		code: 'CHEESEPLZ',
		benefit: {
			type: 'free_item',
			value: 'cheese-tacos',
			description: '🧀 Бесплатная сырная тарелка!'
		},
		used: false
	}
];

export const initialBalance = 15000;
