export type Address = {
    id: number;
    user_id: number;
    receiver_name: string;
    address: string;
    city: string;
    zip: string | null;
    is_default: boolean;
    label: string;
    created_at: string;
    updated_at: string;
};
