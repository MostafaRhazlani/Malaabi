import { Text, View } from "react-native";

export const TimeUnit = ({ value, label, isUrgent }: any) => (
  <View className="items-center">
    <View className="bg-theme-light-card dark:bg-theme-dark-card border border-primary-500/10 rounded-xl w-14 py-2">
      <Text className={`text-2xl font-bold text-center ${isUrgent ? 'text-error' : 'text-primary-500'}`}>{value}</Text>
    </View>
    <Text className="text-[#546E7A] text-[9px] uppercase mt-1">{label}</Text>
  </View>
);