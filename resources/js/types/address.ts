export type Address = {
    id: number;
    user_id: number;
    receiver_name: string;
    address: string;
    city: string;
    province: string | null;
    district: string | null;
    subdistrict: string | null;
    zip: string | null;
    is_default: boolean;
    label: string;
    created_at: string;
    updated_at: string;
};
