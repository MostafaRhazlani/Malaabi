import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { clearSearchQuery, SearchScope, setSearchQuery } from '@/store/slices/searchSlice';
import { RootState } from '@/store/store';

interface CustomHeaderProps {
  title?: string;
  routeName?: string;
  onLogout?: () => void;
}

const ROUTE_SCOPE_MAP: Record<string, SearchScope> = {
  index: 'home',
  favorites: 'favorites',
  team: 'team',
  search: 'global',
  bookings: 'bookings',
  'bookings-history': 'bookings',
};

export function CustomHeader({ title, routeName }: CustomHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ showBack?: string }>();
  const dispatch = useDispatch();
  const scope = routeName ? ROUTE_SCOPE_MAP[routeName] : undefined;
  const searchQuery = useSelector((state: RootState) => (scope ? state.search[scope] : ''));
  const isEditable = Boolean(scope);
  const showSearchBackButton =
    (routeName === 'search' && params.showBack === '1' && router.canGoBack()) ||
    (['bookings', 'bookings-history', 'wallet'].includes(routeName || '') && router.canGoBack());

  return (
    <View
      style={{ paddingTop: insets.top + 10 }}
      className="px-4 flex-row items-center gap-3"
    >
      {showSearchBackButton && (
        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center justify-center"
        >
          <IconSymbol
            name="chevron.left"
            size={20}
            color={colorScheme === 'dark' ? '#CBD5E1' : '#475569'}
          />
        </TouchableOpacity>
      )}

      {/* Search Input Container */}
      <View className="flex-1 flex-row h-12 items-center rounded-full pl-3 pr-1.5 border border-theme-light-tint dark:border-theme-dark-tint bg-white dark:bg-slate-800">
        <TextInput
          placeholder={`Search ${title?.toLowerCase() || 'here'}...`}
          placeholderTextColor={colorScheme === 'dark' ? '#94A3B8' : '#9CA3AF'}
          className="flex-1 mr-2 text-base text-black dark:text-white"
          value={searchQuery}
          onChangeText={(text) => {
            if (!scope) return;
            dispatch(setSearchQuery({ scope, query: text }));
          }}
          autoCapitalize="none"
          editable={isEditable}
        />
        {isEditable && searchQuery.length > 0 ? (
          <TouchableOpacity
            className="w-12 h-9 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 ml-1"
            onPress={() => {
              if (!scope) return;
              dispatch(clearSearchQuery(scope));
            }}
          >
            <IconSymbol name="xmark.circle.fill" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <View className="w-12 h-9 items-center justify-center rounded-full bg-theme-light-tint dark:bg-theme-dark-tint ml-1">
            <IconSymbol name="magnifyingglass" size={22} color="white" />
          </View>
        )}
      </View>

      {/* Action Icons */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
          <IconSymbol name="bubble.right.fill" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
          <View className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
        </TouchableOpacity>

        <TouchableOpacity className="w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
          <IconSymbol name="bell.fill" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
          <View className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
