import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CustomHeaderProps {
  title?: string;
  onLogout?: () => void;
}

export function CustomHeader({ title }: CustomHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  return (
    <View
      style={{ paddingTop: insets.top + 10 }}
      className="px-4 flex-row items-center gap-3"
    >
      {/* Search Input Container */}
      <View className="flex-1 flex-row h-12 items-center rounded-full pl-3 pr-1.5 border border-theme-light-tint dark:border-theme-dark-tint">
        <TextInput 
          placeholder={`Search ${title?.toLowerCase() || 'here'}...`}
          placeholderTextColor={colorScheme === 'dark' ? '#94A3B8' : '#9CA3AF'}
          className="flex-1 mr-2 text-base text-black dark:text-white"
        />
        <TouchableOpacity className="w-12 h-9 items-center justify-center rounded-full bg-theme-light-tint dark:bg-theme-dark-tint ml-1">
          <IconSymbol name="magnifyingglass" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Action Icons */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
          <IconSymbol name="bubble.right.fill" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
          {/* Unread indicator */}
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
