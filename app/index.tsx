import { View, Button, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";

export default function IndexScreen() {
    const router = useRouter();

    return (
        <>
            <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
            <View style={styles.container}>
                <Button title="📦 Köp" onPress={() => router.push("/purchase")} />
                <View style={styles.spacer} />
                <Button title="🔄 Synkronisera" onPress={() => router.push("/sync")} />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#004728",
        justifyContent: "center",
        alignItems: "center",
        padding: 40
    },
    spacer: {
        height: 20
    }
});
