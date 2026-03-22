import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService } from '@/services/auth.service';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import { ROUTES } from '@/constants/routes';

export default function GuardTabsLayout() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const LogoutButton = () => (
    <TouchableOpacity
      onPress={async () => {
        dispatch(clearUser());
        await AuthService.logout();
        router.replace(ROUTES.AUTH_LOGIN);
      }}
      className="mr-4"
    >
      <Text className="text-red-500 text-[15px] font-semibold">Logout</Text>
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: true,
        headerShadowVisible: false,
        headerRight: () => <LogoutButton />,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} weight="regular" />,
        }}
      />
    </Tabs>
  );
}

