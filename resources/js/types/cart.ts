import type { Product } from './product';

export type CartItem = {
    product: Product;
    quantity: number;
    unit_price: number;
    subtotal: number;
    down_payment: number;
};
