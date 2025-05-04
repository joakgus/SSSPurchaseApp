import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { Item } from "../types/Item";

interface Props {
    item: Item;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
}

export const ItemCard: React.FC<Props> = ({ item, quantity, onAdd, onRemove }) => {
    const { width } = useWindowDimensions();
    const cardWidth = width > 1000 ? width / 4 - 20 : width > 600 ? width / 3 - 20 : width / 2 - 20;

    return (
        <TouchableOpacity style={[styles.card, { width: cardWidth }]} onPress={onAdd}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price.toFixed(2)} kr</Text>

            <View style={styles.counterRow}>
                <TouchableOpacity style={styles.button} onPress={(e) => { e.stopPropagation(); onRemove(); }}>
                    <Text style={styles.buttonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterText}>x{quantity}</Text>
                <TouchableOpacity style={styles.button} onPress={(e) => { e.stopPropagation(); onAdd(); }}>
                    <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderRadius: 10,
        margin: 8,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: 8
    },
    name: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#000",
        textAlign: "center"
    },
    price: {
        color: "#004728",
        fontSize: 14,
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
        marginHorizontal: 10
    },
    button: {
        backgroundColor: "#004728",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6
    },
    buttonText: {
        color: "#FDD314",
        fontWeight: "bold",
        fontSize: 18
    }
});
