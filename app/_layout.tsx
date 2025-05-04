import { Stack } from "expo-router";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { Platform, Dimensions, PixelRatio } from "react-native";

function isTablet() {
  const { width, height } = Dimensions.get("window");
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = width / pixelDensity;
  const adjustedHeight = height / pixelDensity;

  return Platform.OS === "ios"
      ? adjustedWidth >= 768 || adjustedHeight >= 768
      : adjustedWidth >= 600 || adjustedHeight >= 600;
}

export default function RootLayout() {
  useEffect(() => {
    const lockOrientation = async () => {
      const tablet = isTablet();

      try {
        if (tablet) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
        }
      } catch (e) {
        console.warn("Orientation lock error:", e);
      }
    };

    lockOrientation();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
