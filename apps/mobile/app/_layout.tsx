import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Toaster } from "sonner-native";
import "../global.css";
import { supabase } from "../lib/supabase";
import { NAV_THEME } from "../lib/theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      // 필요 시 여기서 세션 상태 변경에 반응 (예: 라우팅, 전역 상태 업데이트)
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light}
    >
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "Home" }}
        />
        <Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
      </Stack>
      <Toaster />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
