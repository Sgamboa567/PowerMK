export interface User {
    id: string;
    document: string;
    password: string;
    role: 'admin' | 'consultor' | 'cliente';
}

export interface Client {
    id: string;
    name: string;
    document: string;
    email: string;
    phone: string;
    createdAt: Date;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    imageUrl: string;
    category: string;
    status: 'active' | 'discontinued';
}

export interface Sale {
    id: string;
    clientId: string;
    consultantId: string;
    products: Product[];
    totalAmount: number;
    createdAt: Date;
    paymentStatus: 'pending' | 'completed';
}

export interface Inventory {
    productId: string;
    stock: number;
    threshold: number;
}