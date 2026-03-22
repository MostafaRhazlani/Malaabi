import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '@/store/hooks';

export default function PlayerHomeScreen() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <SafeAreaView className="flex-1" edges={['bottom']}>
      <View className="flex-1 items-center justify-center px-8 gap-4">
        <View className="w-20 h-20 rounded-full bg-primary-600 items-center justify-center mb-2">
          <Text className="text-white text-3xl font-bold">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back!
        </Text>
        {user?.email && (
          <Text className="text-gray-400 dark:text-gray-400 text-sm">{user.email}</Text>
        )}
        {user?.role && (
          <View className="px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
            <Text className="text-primary-700 dark:text-primary-400 text-sm font-medium">
              {user.role}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
