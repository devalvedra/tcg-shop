export type ProductStatus = 'ready' | 'pre-order' | 'unavailable';

export type ProductCategory = {
    id: number;
    name: string;
    slug: string;
};

export type ProductImage = {
    id: number;
    product_id: number;
    image: string;
    url: string | null;
    sort_order: number;
};

export type Product = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    youtube_link: string | null;
    category: string;
    category_name: string;
    price: string;
    sell_price: string | null;
    down_payment: string;
    stock: number;
    status: ProductStatus;
    open_po_date: string | null;
    close_po_date: string | null;
    images: ProductImage[];
    created_at: string;
    updated_at: string;
};
