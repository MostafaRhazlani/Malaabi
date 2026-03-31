import React, { useState } from 'react';
import {
  View,
  Image,
  Pressable,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface StadiumHeaderImageProps {
  heroImages: string[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
  tint: string;
}

export function StadiumHeaderImage({
  heroImages,
  isFavorite,
  onToggleFavorite,
  onBack,
  tint,
}: StadiumHeaderImageProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View className="h-full w-full">
      <Animated.FlatList
        data={heroImages}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const contentOffset = e.nativeEvent.contentOffset.x;
          const viewSize = e.nativeEvent.layoutMeasurement.width;
          const index = Math.floor(contentOffset / viewSize);
          setActiveIndex(index);
        }}
        renderItem={({ item }: { item: string }) => (
          <Image
            source={{ uri: item }}
            style={{ width: windowWidth, height: '100%' }}
            resizeMode="cover"
          />
        )}
      />
      {/* Nav overlay */}
      <View
        className="absolute left-0 right-0 flex-row justify-between items-center px-5"
        style={{ top: insets.top + 8 }}
      >
        <Pressable
          onPress={onBack}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.28)' }}
        >
          <IconSymbol name="chevron.left" size={22} color="#fff" weight="bold" />
        </Pressable>

        <Pressable
          onPress={onToggleFavorite}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.28)' }}
        >
          <IconSymbol
            name={isFavorite ? 'heart.fill' : 'heart'}
            size={22}
            color={isFavorite ? '#EF4444' : '#fff'}
            weight={isFavorite ? 'fill' : 'regular'}
          />
        </Pressable>
      </View>

      {/* Pagination dots */}
      {heroImages.length > 1 && (
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center gap-1.5">
          {heroImages.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === activeIndex ? tint : 'rgba(255,255,255,0.65)',
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
