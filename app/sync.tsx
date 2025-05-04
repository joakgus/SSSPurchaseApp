import React, { useEffect, useState } from "react";
import {
    View, Text, TextInput, Button, Modal, Alert, StyleSheet, TouchableOpacity
} from "react-native";
import axios from "axios";
import {
    saveLaptopIp, getLaptopIp,
    saveLaptopStand, getLaptopStand,
    downloadImagesAndSaveItems, getItems,
    clearPurchases
} from "../lib/storage";
import { Item } from "../types/Item";
import { syncPurchasesToServer } from "../lib/sync";

export default function SyncScreen() {
    const [ip, setIp] = useState<string | null>(null);
    const [stand, setStand] = useState<string | null>(null);
    const [tempIp, setTempIp] = useState("");
    const [stands, setStands] = useState<string[]>([]);
    const [showIpPrompt, setShowIpPrompt] = useState(false);
    const [showStandPrompt, setShowStandPrompt] = useState(false);

    useEffect(() => {
        (async () => {
            const savedIp = await getLaptopIp();
            const savedStand = await getLaptopStand();
            if (!savedIp) setShowIpPrompt(true);
            else {
                setIp(savedIp);
                if (!savedStand) fetchStands(savedIp);
                else setStand(savedStand);
            }
        })();
    }, []);

    const handleClearPurchases = async () => {
        Alert.alert(
            "Bekräfta",
            "Vill du rensa alla osynkade köp?",
            [
                { text: "Avbryt", style: "cancel" },
                {
                    text: "Rensa",
                    style: "destructive",
                    onPress: async () => {
                        await clearPurchases();
                        Alert.alert("Rensat", "Osynkade köp har tagits bort.");
                    }
                }
            ]
        );
    };

    const fetchStands = async (ip: string) => {
        try {
            const res = await axios.get(`http://${ip}:5000/stands`);
            setStands(res.data);
            setShowStandPrompt(true);
        } catch {
            Alert.alert("Fel", "Kunde inte hämta stånd.");
        }
    };

    const confirmIp = async () => {
        const cleaned = tempIp.replace(/,/g, ".").trim();
        if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(cleaned)) {
            Alert.alert("Ogiltig IP", "Ex: 192.168.0.42");
            return;
        }
        await saveLaptopIp(cleaned);
        setIp(cleaned);
        setShowIpPrompt(false);
        fetchStands(cleaned);
    };

    const confirmStand = async (selected: string) => {
        if (!ip) return;

        await saveLaptopStand(selected);
        setStand(selected);
        setShowStandPrompt(false);

        try {
            const res = await axios.get(`http://${ip}:5000/items`);
            const filtered = res.data.filter((i: Item) => i.stand === selected);
            await downloadImagesAndSaveItems(filtered, ip);
            await getItems(); // optional: refresh in memory
            Alert.alert("Stånd uppdaterat", `Varor från '${selected}' har hämtats.`);
        } catch (err) {
            Alert.alert("Fel", "Kunde inte ladda varor för valt stånd.");
        }
    };


    const handleResync = async () => {
        if (!ip || !stand) return;
        try {
            const res = await axios.get(`http://${ip}:5000/items`);
            const filtered = res.data.filter((i: Item) => i.stand === stand);
            await downloadImagesAndSaveItems(filtered, ip);
            await getItems();
            Alert.alert("Klart", "Varor har synkroniserats.");
        } catch {
            Alert.alert("Fel", "Kunde inte uppdatera.");
        }
    };

    const handleSyncPurchases = async () => {
        if (!ip) return;
        const success = await syncPurchasesToServer(ip);
        Alert.alert(success ? "Synkat" : "Misslyckades", success ? "Köp skickade." : "Synk misslyckades.");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>IP: {ip ?? "ej satt"}</Text>
            <TouchableOpacity style={styles.changeButton} onPress={() => setShowIpPrompt(true)}>
                <Text style={styles.changeText}>Byt IP-adress</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Stånd: {stand ?? "ej valt"}</Text>
            {ip && (
                <TouchableOpacity style={styles.changeButton} onPress={() => fetchStands(ip)}>
                    <Text style={styles.changeText}>Byt stånd</Text>
                </TouchableOpacity>
            )}

            <View style={styles.buttons}>
                <Button title="🔄 Resynkronisera" onPress={handleResync} />
                <Button title="📤 Synka köp" onPress={handleSyncPurchases} />
                <Button title="🗑️ Rensa osynkade köp" onPress={handleClearPurchases} color="#cc0000" />
            </View>

            {/* IP Modal */}
            <Modal visible={showIpPrompt} transparent animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.modalBox}>
                        <Text>Ange IP-adress</Text>
                        <TextInput
                            placeholder="192.168.0.42"
                            keyboardType="numeric"
                            value={tempIp}
                            onChangeText={(t) => setTempIp(t.replace(/,/g, "."))}
                            style={styles.input}
                        />
                        <Button title="Spara" onPress={confirmIp} />
                    </View>
                </View>
            </Modal>

            {/* Stand Modal */}
            <Modal visible={showStandPrompt} transparent animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.modalBox}>
                        <Text>Välj ett stånd</Text>
                        {stands.map((s) => (
                            <TouchableOpacity key={s} onPress={() => confirmStand(s)} style={styles.standBtn}>
                                <Text>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#004728" },
    label: { color: "#fff", fontSize: 16, marginBottom: 10 },
    buttons: { gap: 20, marginTop: 20 },
    modalBackground: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00000066" },
    modalBox: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
    input: { borderColor: "#aaa", borderWidth: 1, padding: 8, marginTop: 10, marginBottom: 20 },
    standBtn: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: "#FDD314",
        borderRadius: 5
    },
    changeButton: {
        marginTop: 5,
        padding: 6,
        backgroundColor: "#FDD314",
        borderRadius: 5,
        alignSelf: "flex-start"
    },
    changeText: {
        color: "#000",
        fontWeight: "bold"
    }
});
