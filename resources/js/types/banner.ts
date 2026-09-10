export type Banner = {
    id: number;
    title: string;
    subtitle: string | null;
    image: string | null;
    image_mobile: string | null;
    url: string | null;
    mobile_url: string | null;
    link_url: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};
