import React from 'react';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface TeamHeaderImageProps {
  logoSource: any;
  onBack: () => void;
}

export function TeamHeaderImage({ logoSource, onBack }: TeamHeaderImageProps) {
  const { width: windowWidth } = useWindowDimensions();

  return (
    <View className="w-full h-full">
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack}
        className="absolute top-14 left-6 w-10 h-10 bg-black/20 dark:bg-white/10 rounded-full items-center justify-center z-50 backdrop-blur-md"
      >
        <IconSymbol name="chevron.left" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Blurred background logo */}
      <Image
        source={logoSource}
        style={{ width: windowWidth, height: '100%', opacity: 0.15 }}
        contentFit="cover"
        blurRadius={1}
      />
    </View>
  );
}
