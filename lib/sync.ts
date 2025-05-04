import axios from "axios";
import { getPurchases, clearPurchases } from "./storage";
import { Purchase } from "../types/Item";

export const syncPurchasesToServer = async (ip: string): Promise<boolean> => {
    try {
        const purchases: Purchase[] = await getPurchases();
        if (purchases.length === 0) return true;

        const response = await axios.post(`http://${ip}:5000/upload-purchases`, purchases, {
            headers: { "Content-Type": "application/json" }
        });

        if (response.status === 200) {
            await clearPurchases();
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.warn("Fel vid synk:", e);
        return false;
    }
};
