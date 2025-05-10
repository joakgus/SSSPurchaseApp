export interface Item {
    id: number;
    name: string;
    price: number;
    image: string;
    stands: string[];
}

export interface Purchase {
    itemId: number;
    quantity: number;
    timestamp: string;
    itemName: string;
}

export interface CartEntry {
    item: Item;
    quantity: number;
}
