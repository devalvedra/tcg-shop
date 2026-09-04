export type PaymentMethodOption = {
    id: number;
    name: string;
    code: string;
    description: string | null;
    instructions: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
};
