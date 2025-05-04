import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, GestureResponderEvent } from "react-native";
import { Item } from "../types/Item";

interface Props {
    item: Item;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
}

export const ItemCard: React.FC<Props> = ({ item, quantity, onAdd, onRemove }) => (
    <TouchableOpacity style={styles.card} onPress={onAdd}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price.toFixed(2)} kr</Text>

        <View style={styles.counterRow}>
            <TouchableOpacity style={styles.button} onPress={(e: GestureResponderEvent) => { e.stopPropagation(); onRemove(); }}>
                <Text style={styles.buttonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.counterText}>x{quantity}</Text>

            <TouchableOpacity style={styles.button} onPress={(e: GestureResponderEvent) => { e.stopPropagation(); onAdd(); }}>
                <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        padding: 10,
        borderRadius: 8,
        margin: 8,
        alignItems: "center",
        width: "45%",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3
    },
    image: {
        width: 80,
        height: 80,
        marginBottom: 8
    },
    name: {
        fontWeight: "bold",
        color: "#000"
    },
    price: {
        color: "#004728",
        marginBottom: 8
    },
    counterRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4
    },
    counterText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#004728",
        marginHorizontal: 8
    },
    button: {
        backgroundColor: "#004728",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5
    },
    buttonText: {
        color: "#FDD314",
        fontWeight: "bold",
        fontSize: 16
    }
});
