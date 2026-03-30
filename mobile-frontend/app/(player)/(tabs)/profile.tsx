import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useRouter, Tabs } from 'expo-router';
import { Image } from 'expo-image';
import { BASE_URL } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ROUTES } from '@/constants/routes';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { clearUser } from '@/store/slices/authSlice';
import { AuthService } from '@/services/auth.service';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ActionCard } from '@/components/features/profile/action-card';
import { MenuOption } from '@/components/features/profile/menu-option';

const getAvatarUri = (profileImg?: string | null) => {
  if (!profileImg) return null;
  if (profileImg.startsWith('http')) return profileImg;
  return `${BASE_URL}${profileImg}`;
};

export default function PlayerProfileScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { isDark } = useColorScheme();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    dispatch(clearUser());
    await AuthService.logout();
    router.replace(ROUTES.AUTH_LOGIN);
  };

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View className="flex-1 bg-theme-light-background dark:bg-theme-dark-background">
      <Tabs.Screen options={{ headerShown: false }} />

      <View className="bg-theme-light-card dark:bg-theme-dark-card rounded-b-[40px] pt-14 pb-8 px-6">
        <View className="flex-row items-center justify-between mt-2">
          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-theme-light-background dark:bg-theme-dark-background items-center justify-center border border-white/10"
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={iconColor} />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Profile</Text>
        </View>

        <View className="items-center mt-6">
          <View className="w-28 h-28 rounded-full border border-white/50 p-1 mb-3 bg-theme-light-tint dark:bg-theme-dark-tint overflow-hidden">
            <Image
              source={{ uri: getAvatarUri(user?.profileImg) ?? '' }}
              style={{ width: '100%', height: '100%', borderRadius: 999 }}
              contentFit="cover"
            />
          </View>
          <Text className="text-theme-light-text dark:text-theme-dark-text text-2xl font-bold mb-1">{fullName}</Text>
          <Text className="text-theme-light-text dark:text-theme-dark-text text-sm mb-6">{user?.email ?? ''}</Text>

          <View className="flex-row justify-between w-full px-2 gap-3">
            <ActionCard
              iconName="bell.fill"
              title="Notifications"
            />
            <ActionCard
              iconName="bubble.right.fill"
              title="Chat"
            />
            <ActionCard
              iconName="ticket"
              title="Tickets"
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
        <View className="p-3 mb-10">
          <MenuOption
            iconName="creditcard.fill"
            title="Wallet"
            onPress={() => router.push(ROUTES.PLAYER_WALLET)}
            hasBorder
          />
          <MenuOption
            iconName="person.fill"
            title="Edit Profile"
            onPress={() => router.push(ROUTES.PLAYER_EDIT_PROFILE)}
            hasBorder
          />
          <MenuOption
            iconName="questionmark.circle.fill"
            title="Help & Support"
            hasBorder
          />
          <MenuOption
            iconName="gearshape.fill"
            title="Settings"
            hasBorder
          />
          <MenuOption
            iconName="rectangle.portrait.and.arrow.right"
            title="Log out"
            onPress={handleLogout}
            isLogout
          />
        </View>
      </ScrollView>
    </View>
  );
}
