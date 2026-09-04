export type PromoCode = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    discount_type: 'percent' | 'fixed';
    discount_value: string;
    min_subtotal: string;
    max_discount: string | null;
    usage_limit: number | null;
    uses_count: number;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};
