export interface Item {
    id: number;
    name: string;
    price: number;
    image: string;
    stand: string;
}

export interface Purchase {
    itemId: number;
    quantity: number;
    timestamp: string;
}

export interface CartEntry {
    item: Item;
    quantity: number;
}
