import { Text, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function StadiumHeaderInfo({ name, city, rating }: { name: string, city: string, rating: string }) {
  const tint = useThemeColor({}, 'tint');
  const { isDark } = useColorScheme();
  const tintBg = isDark ? '#082b1f' : '#effdf5';

  return (
    <View>
      <Text className="text-2xl font-bold text-slate-900 dark:text-white">{name}</Text>
      <View className="flex-row items-center gap-3 mt-2.5">
        <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: tintBg }}>
          <Text className="text-xs font-semibold" style={{ color: tint }}>Football Pitch</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <IconSymbol name="star.fill" size={15} color="#F59E0B" />
          <Text className="text-sm font-bold text-slate-900 dark:text-white">{rating}</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400"> ({city})</Text>
        </View>
      </View>
    </View>
  );
}