import { StateCreator } from 'zustand';
import { menuItems } from '../types';

export interface OrdersSlice {
	orders: Record<string, number>;
	addItem: (id: string) => void;
	removeItem: (id: string) => void;
}

export const createOrdersSlice: StateCreator<OrdersSlice> = (set, get) => ({
	orders: {},

	addItem: (id) => {
		const item = menuItems.find((i) => i.id === id);
		if (!item) return;

		const currentBalance = (get() as any).getCalculatedBalance?.();
		if (currentBalance >= item.price) {
			set((state: OrdersSlice) => ({
				orders: {
					...state.orders,
					[id]: (state.orders[id] || 0) + 1
				}
			}));
		}
	},

	removeItem: (id) => {
		const item = menuItems.find((i) => i.id === id);
		if (!item || !(get() as OrdersSlice).orders[id]) return;
		set((state: OrdersSlice) => {
			const newCount = state.orders[id] - 1;
			const newOrders = { ...state.orders };
			if (newCount <= 0) delete newOrders[id];
			else newOrders[id] = newCount;
			return { orders: newOrders };
		});
	}
});
