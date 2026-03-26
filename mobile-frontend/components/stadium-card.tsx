import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '@/services/api';
import type { Stadium } from '@/services/player.service';

interface StadiumCardProps {
  stadium: Stadium;
  onPress?: () => void;
}

export default function StadiumCard({ stadium, onPress }: StadiumCardProps) {
  const imageUrl = stadium.images[0]
    ? `${BASE_URL}${stadium.images[0]}`
    : null;

  return (
    <TouchableOpacity
      className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100 dark:border-zinc-800"
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Cover Image */}
      <View className="w-full h-44 bg-gray-100 dark:bg-zinc-800">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="football-outline" size={48} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Info */}
      <View className="px-4 pt-3 pb-4 gap-2">
        <Text
          className="text-lg font-bold text-gray-900 dark:text-white"
          numberOfLines={1}
        >
          {stadium.name}
        </Text>

        <View className="flex-row items-center gap-1">
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text className="text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {stadium.city} — {stadium.address}
          </Text>
        </View>

        {/* Prices */}
        <View className="flex-row gap-3 mt-1">
          <View className="flex-row items-center gap-1 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
            <Ionicons name="football" size={12} color="#139765" />
            <Text className="text-xs font-semibold text-primary-700 dark:text-primary-400">
              Full: {stadium.priceFullMatch} MAD
            </Text>
          </View>
          <View className="flex-row items-center gap-1 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Half: {stadium.priceHalfMatch} MAD
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
