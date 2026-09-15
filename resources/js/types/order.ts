export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled';

export type PaymentStatus = 'unpaid' | 'dp' | 'paid';

export type PaymentMethod = 'gcash' | 'maya' | 'bank-transfer' | 'cod';

export type OrderCustomer = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
};

export type OrderItem = {
    id: number;
    order_id: number;
    product_id: number | null;
    product_name: string;
    product_image: string | null;
    product_image_url: string | null;
    unit_price: string;
    quantity: number;
    subtotal: string;
    created_at: string;
    updated_at: string;
};

export type Order = {
    id: number;
    order_number: string;
    customer_id: number;
    customer: OrderCustomer;
    status: OrderStatus;
    payment_method: PaymentMethod | null;
    payment_status: PaymentStatus;
    down_payment: string;
    subtotal: string;
    shipping_fee: string;
    discount: string;
    total: string;
    notes: string | null;
    shipping_address: string | null;
    shipping_city: string | null;
    shipping_province: string | null;
    shipping_district: string | null;
    shipping_subdistrict: string | null;
    shipping_zip: string | null;
    receiver_name: string | null;
    promo_code: { id: number; code: string; name: string } | null;
    items: OrderItem[];
    created_at: string;
    updated_at: string;
};
