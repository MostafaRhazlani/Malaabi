import { Text, View } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function StadiumFeatures({ features }: { features: any[] }) {
  const { isDark } = useColorScheme();
  const tintBg = isDark ? '#082b1f' : '#effdf5';

  return (
    <View className="flex-row items-center justify-between mt-6">
      {features.map((f, i) => (
        <View key={i} className="flex-row items-center gap-2">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center" 
            style={{ backgroundColor: tintBg }}
          >
            {f.icon}
          </View>
          <Text className="text-sm font-medium text-slate-800 dark:text-slate-200">{f.label}</Text>
        </View>
      ))}
    </View>
  );
}