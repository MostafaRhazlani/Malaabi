import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface MenuOptionProps {
  iconName: IconSymbolName;
  title: string;
  isLogout?: boolean;
  hasBorder?: boolean;
  onPress?: () => void;
}

export function MenuOption({
  iconName,
  title,
  isLogout = false,
  hasBorder = false,
  onPress
}: MenuOptionProps) {
  const iconColor = useThemeColor({}, 'icon');
  const chevronColor = useThemeColor({ light: '#94A3B8', dark: '#475569' }, 'icon');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between py-4 px-3 ${hasBorder ? 'border-b border-slate-100 dark:border-slate-800 rounded-lg' : 'rounded-lg'}`}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/70 items-center justify-center">
          <IconSymbol name={iconName} size={22} color={isLogout ? '#EF4444' : iconColor} />
        </View>
        <Text className={`text-base font-bold ${isLogout ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
          {title}
        </Text>
      </View>
      {!isLogout && <IconSymbol name="chevron.right" size={20} color={chevronColor} />}
    </TouchableOpacity>
  );
}
