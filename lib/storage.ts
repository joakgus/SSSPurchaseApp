import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Item, Purchase } from "../types/Item";

const LOCAL_IMAGE_DIR = FileSystem.documentDirectory + "images/";

export const getItems = async (): Promise<Item[]> => {
    const data = await AsyncStorage.getItem("ITEMS");
    return data ? JSON.parse(data) : [];
};

export const saveLaptopIp = async (ip: string) => {
    await AsyncStorage.setItem("LAPTOP_IP", ip);
};

export const getLaptopIp = async (): Promise<string | null> => {
    return await AsyncStorage.getItem("LAPTOP_IP");
};

export const saveLaptopStand = async (stand: string) => {
    await AsyncStorage.setItem("STAND", stand);
};

export const getLaptopStand = async (): Promise<string | null> => {
    return await AsyncStorage.getItem("STAND");
};

export const clearLaptopConfig = async () => {
    await AsyncStorage.multiRemove(["LAPTOP_IP", "STAND"]);
};

export const savePurchase = async (purchase: {
    itemId: number;
    quantity: number;
    itemName: string;
    timestamp: string;
    stand: string | null
}) => {
    const existing = await getPurchases();
    existing.push(purchase);
    await AsyncStorage.setItem("PURCHASES", JSON.stringify(existing));
};

export const getPurchases = async (): Promise<Purchase[]> => {
    const data = await AsyncStorage.getItem("PURCHASES");
    return data ? JSON.parse(data) : [];
};

export const clearPurchases = async () => {
    await AsyncStorage.removeItem("PURCHASES");
};

const SERVER_IMAGE_URL = (ip: string, filename: string) =>
    `http://${ip}:5000/images/${filename}`;

const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(LOCAL_IMAGE_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(LOCAL_IMAGE_DIR, { intermediates: true });
    }
};

export const downloadImagesAndSaveItems = async (items: Item[], ip: string) => {
    await ensureDirExists();

    const updatedItems = await Promise.all(
        items.map(async (item) => {
            const remoteUrl = SERVER_IMAGE_URL(ip, item.image);
            const localPath = LOCAL_IMAGE_DIR + item.image;
            try {
                const fileInfo = await FileSystem.getInfoAsync(localPath);
                if (!fileInfo.exists) {
                    await FileSystem.downloadAsync(remoteUrl, localPath);
                }
                return { ...item, image: localPath };
            } catch (e) {
                console.warn(`Misslyckades ladda ner bild: ${item.image}`, e);
                return { ...item, image: remoteUrl };
            }
        })
    );

    await AsyncStorage.setItem("ITEMS", JSON.stringify(updatedItems));
};
