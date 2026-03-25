import { Stadium, STADIUM_TYPE_LABEL } from '@/interfaces/stadium.interface';
import { BASE_URL } from '@/services/api';
import { IconSymbol } from './ui/icon-symbol';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1518605368461-1e1e111e1ebc?auto=format&fit=crop&q=80&w=400&h=300';

export function StadiumCard({ stadium }: { stadium: Stadium }) {
  const imageUri = stadium.images?.[0]
    ? `${BASE_URL}${stadium.images[0]}`
    : PLACEHOLDER_IMAGE;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="flex-1 m-1.5 bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700/50 shadow-sm"
      style={{ maxWidth: '48%' }}
    >
      <View>
        <Image
          source={{ uri: imageUri }}
          className="w-full h-44 bg-gray-200 dark:bg-slate-700"
          resizeMode="cover"
        />
        <View className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 rounded-full px-2 py-0.5 flex-row items-center gap-0.5">
          <Text className="text-xs font-bold text-amber-500">★</Text>
          <Text className="text-xs font-bold text-slate-800 dark:text-white">New</Text>
        </View>
      </View>

      <View className="p-2.5">
        <Text className="text-sm font-bold text-slate-800 dark:text-white" numberOfLines={1}>
          {stadium.name}
        </Text>
        <View className="flex-row items-center gap-0.5 mt-0.5">
          <IconSymbol name="map" size={11} color="#94A3B8" />
          <Text className="text-xs text-slate-500 dark:text-slate-400" numberOfLines={1}>
            {stadium.city}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-sm font-black text-theme-light-tint dark:text-theme-dark-tint">
            {stadium.priceFullMatch} DH
          </Text>
          <View className="bg-gray-100 dark:bg-slate-700 rounded-full px-1.5 py-0.5">
            <Text className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              {STADIUM_TYPE_LABEL[stadium.stadiumType] ?? stadium.stadiumType}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}