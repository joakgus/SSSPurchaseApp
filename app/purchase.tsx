import React, { useEffect, useState } from "react";
import {
    View, Text, FlatList, ActivityIndicator, Modal, Button,
    StyleSheet, TouchableOpacity, Alert, TextInput
} from "react-native";
import {Stack, useRouter} from "expo-router";
import { ItemCard } from "../components/ItemCard";
import { Item, CartEntry } from "../types/Item";
import {
    getItems, getLaptopStand, savePurchase
} from "../lib/storage";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { useWindowDimensions } from "react-native";

export default function PurchaseScreen() {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartEntry[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [stand, setStand] = useState<string | null>(null);

    const [titleTapCount, setTitleTapCount] = useState(0);
    const [showPinPrompt, setShowPinPrompt] = useState(false);
    const [enteredPin, setEnteredPin] = useState("");
    const EXIT_PIN = "1234";

    const { width } = useWindowDimensions();
    const numColumns = width > 600 ? 4 : 2;

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => true;
            BackHandler.addEventListener("hardwareBackPress", onBackPress);
        }, [])
    );

    useEffect(() => {
        const load = async () => {
            try {
                const loaded = await getItems();
                setItems(loaded);

                const savedStand = await getLaptopStand();
                if (savedStand) setStand(savedStand);
            } catch {
                Alert.alert("Fel", "Kunde inte läsa varor eller stånd.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);


    const handleItemAdd = (item: Item) => {
        setCart((prev) => {
            const existing = prev.find((e) => e.item.id === item.id);
            return existing
                ? prev.map((e) => e.item.id === item.id ? { ...e, quantity: e.quantity + 1 } : e)
                : [...prev, { item, quantity: 1 }];
        });
    };

    const handleItemRemove = (item: Item) => {
        setCart((prev) => {
            const existing = prev.find((e) => e.item.id === item.id);
            if (!existing) return prev;
            return existing.quantity <= 1
                ? prev.filter((e) => e.item.id !== item.id)
                : prev.map((e) => e.item.id === item.id ? { ...e, quantity: e.quantity - 1 } : e);
        });
    };

    const removeItemFromCart = (itemId: number) => {
        setCart((prev) => prev.filter((e) => e.item.id !== itemId));
    };

    const confirmPurchase = async () => {
        const timestamp = new Date().toISOString();
        for (const entry of cart) {
            await savePurchase({
                itemId: entry.item.id,
                quantity: entry.quantity,
                itemName: entry.item.name,
                timestamp
            });
        }
        setCart([]);
        setShowConfirm(false);
        Alert.alert("Köpt", "Köpet har sparats.");
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#004728", paddingTop: 40 }}>
            <TouchableOpacity onPress={() => {
                setTitleTapCount(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 5) {
                        setShowPinPrompt(true);
                        return 0;
                    }
                    return newCount;
                });
            }}>
                <Text style={styles.title}>{stand ? `${stand}` : "Köp"}</Text>
            </TouchableOpacity>

            {/* Summary Modal */}
            <Modal visible={showSummary} transparent animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Sammanställning</Text>
                        {cart.map((entry) => (
                            <View key={entry.item.id} style={styles.summaryRow}>
                                <Text style={{ flex: 1 }}>{entry.quantity}x {entry.item.name}</Text>
                                <Text style={{ width: 60, textAlign: "right" }}>
                                    {(entry.item.price * entry.quantity).toFixed(2)} kr
                                </Text>
                                <TouchableOpacity onPress={() => removeItemFromCart(entry.item.id)}>
                                    <Text style={{ color: "red", marginLeft: 10 }}>❌</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        <Text style={{ fontWeight: "bold", marginTop: 10 }}>
                            Totalt: {cart.reduce((s, e) => s + e.quantity * e.item.price, 0).toFixed(2)} kr
                        </Text>
                        <View style={{ marginTop: 20 }}>
                            <Button title="Stäng" onPress={() => setShowSummary(false)} color="#888" />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Confirm Modal */}
            <Modal visible={showConfirm} transparent animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Bekräfta köp</Text>
                        {cart.map((entry) => (
                            <Text key={entry.item.id}>
                                {entry.quantity}x {entry.item.name} ({(entry.item.price * entry.quantity).toFixed(2)} kr)
                            </Text>
                        ))}
                        <Text style={{ fontWeight: "bold", marginTop: 10 }}>
                            Totalt: {cart.reduce((s, e) => s + e.quantity * e.item.price, 0).toFixed(2)} kr
                        </Text>
                        <View style={{ marginTop: 20 }}>
                            <Button title="Skicka köp" color="#004728" onPress={confirmPurchase} />
                            <View style={{ height: 10 }} />
                            <Button title="Stäng" onPress={() => setShowConfirm(false)} color="#888" />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* PIN Modal */}
            <Modal visible={showPinPrompt} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Ange PIN</Text>
                        <TextInput
                            style={styles.input}
                            value={enteredPin}
                            onChangeText={setEnteredPin}
                            keyboardType="numeric"
                            secureTextEntry
                            placeholder="PIN"
                            placeholderTextColor="#999"
                        />
                        <Button title="Bekräfta" onPress={() => {
                            if (enteredPin === EXIT_PIN) {
                                setShowPinPrompt(false);
                                setEnteredPin("");
                                router.back();
                            } else {
                                Alert.alert("Fel", "Fel PIN");
                                setEnteredPin("");
                            }
                        }} />
                        <View style={{ marginTop: 10 }}>
                            <Button title="Avbryt" color="#888" onPress={() => setShowPinPrompt(false)} />
                        </View>
                    </View>
                </View>
            </Modal>

            {loading ? (
                <ActivityIndicator size="large" style={{ flex: 1 }} />
            ) : (
                <>
                    <Stack.Screen options={{gestureEnabled: false, headerShown: false, headerBackVisible: false}} />
                    <FlatList
                        key={numColumns}
                        data={items}
                        numColumns={numColumns}
                        keyExtractor={(i) => i.id.toString()}
                        renderItem={({ item }) => {
                            const cartEntry = cart.find((c) => c.item.id === item.id);
                            const quantity = cartEntry?.quantity ?? 0;

                            return (
                                <ItemCard
                                    item={item}
                                    quantity={quantity}
                                    onAdd={() => handleItemAdd(item)}
                                    onRemove={() => handleItemRemove(item)}
                                />
                            );
                        }}
                        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 100 }}
                    />
                    {cart.length > 0 && (
                        <View style={styles.bottomBar}>
                            <Text style={styles.confirmText}>
                                Totalt:{" "}
                                {cart.reduce((sum, entry) => sum + entry.quantity * entry.item.price, 0).toFixed(2)} kr
                            </Text>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSummary(true)}>
                                <Text style={styles.cancelButtonText}>Visa sammanställning</Text>
                            </TouchableOpacity>
                            <View style={styles.bottomButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setCart([])}>
                                    <Text style={styles.cancelButtonText}>Avbryt köp</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.confirmButton} onPress={() => setShowConfirm(true)}>
                                    <Text style={styles.confirmButtonText}>Bekräfta köp</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalContainer: {
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 10,
        width: "80%"
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "#fff",
        marginBottom: 10
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        color: "#000"
    },
    bottomBar: {
        padding: 12,
        backgroundColor: "#004728",
        borderTopWidth: 1,
        borderColor: "#ccc"
    },
    bottomButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 8
    },
    cancelButton: {
        backgroundColor: "#222",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginRight: 10
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "bold"
    },
    confirmButton: {
        backgroundColor: "#FDD314",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5
    },
    confirmButtonText: {
        color: "#000",
        fontWeight: "bold"
    },
    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 5
    },
    confirmText: {
        color: "#fff",
        fontSize: 16
    }
});
