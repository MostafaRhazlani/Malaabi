import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthService } from '@/services/auth.service';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import { ROUTES } from '@/constants/routes';
import { IconSymbolName } from '@/components/ui/icon-symbol';
import { TabButton } from '@/components/ui/tab-button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TabItem } from '@/interfaces/tab-item.interface';
import { CustomHeader } from '@/components/ui/custom-header';

const TabArr: TabItem[] = [
  { route: 'index', label: 'Home', icon: 'house.fill' },
  { route: 'favorites', label: 'Favorites', icon: 'heart.fill' },
  { route: 'search', label: 'Search', icon: 'magnifyingglass' },
  { route: 'team', label: 'Team', icon: 'person.3.fill' },
  { route: 'profile', label: 'Profile', icon: 'person.fill' },
];

export default function PlayerTabsLayout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    dispatch(clearUser());
    await AuthService.logout();
    router.replace(ROUTES.AUTH_LOGIN);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom / 2 : 0
          },
        ],
        headerRight: () => (
          <Pressable className="mr-4" onPress={handleLogout}>
            <Text className="text-red-500 font-semibold">Logout</Text>
          </Pressable>
        ),
      }}>
      {
        TabArr.map((item, index) => {
          return (
            <Tabs.Screen
              key={index}
              name={item.route}
              options={{
                title: item.label,
                tabBarShowLabel: false,
                tabBarButton: (props) => <TabButton {...props} item={item} />,
                ...(item.route !== 'profile' ? {
                  header: () => <CustomHeader title={item.label} onLogout={handleLogout} />
                } : {})
              }}
            />
          )
        })
      }
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    borderTopWidth: 0,
  },
});
