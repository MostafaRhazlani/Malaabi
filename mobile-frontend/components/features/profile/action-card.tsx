import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ActionCardProps {
  iconName: IconSymbolName;
  title: string;
  onPress?: () => void;
}

export function ActionCard({
  iconName,
  title,
  onPress
}: ActionCardProps) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 bg-theme-light-background dark:bg-theme-dark-background border border-white/10 rounded-3xl p-4 items-center py-5"
    >
      <View style={{ marginBottom: 8 }}>
        <IconSymbol name={iconName} size={28} color={iconColor} />
      </View>
      <Text className="text-theme-light-text dark:text-theme-dark-text text-xs font-medium">{title}</Text>
    </TouchableOpacity>
  );
}
