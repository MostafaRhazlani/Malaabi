import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CustomLightTheme, CustomDarkTheme } from '@/constants/navigation-themes';

import AuthInitializer from '@/components/auth-initializer';
import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/constants/routes';

export const unstable_settings = {
  anchor: '(player)',
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AuthInitializer />
        <RootLayoutInner />
      </SafeAreaProvider>
    </Provider>
  );
}

function RootLayoutInner() {
  const { isDark } = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user) {
      if (!inAuthGroup) router.replace(ROUTES.AUTH_LOGIN);
    } else if (user.role === 'PLAYER' && inAuthGroup) {
      router.replace(ROUTES.PLAYER);
    } else if (user.role === 'GUARD' && inAuthGroup) {
      router.replace(ROUTES.GUARD);
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const appTheme = isDark ? CustomDarkTheme : CustomLightTheme;

  return (
    <ThemeProvider value={appTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: appTheme.colors.card,
          },
          headerShadowVisible: false,
          headerTintColor: appTheme.colors.text,
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(player)" options={{ headerShown: false }} />
        <Stack.Screen name="(guard)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
