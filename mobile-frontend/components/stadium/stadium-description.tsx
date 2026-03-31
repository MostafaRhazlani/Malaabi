import { Text, View } from 'react-native';

export function StadiumDescription({ overview }: { overview: string }) {
  return (
    <View className="mt-7">
      <Text className="text-lg font-bold text-slate-900 dark:text-white mb-2">Overview</Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 leading-6">{overview}</Text>
    </View>
  );
}
