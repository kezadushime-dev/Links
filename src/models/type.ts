export interface Category {
    id: string;
    name: string;
    description: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    categoryId: string;
    quantity: number;
    inStock: boolean;
}

export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
}