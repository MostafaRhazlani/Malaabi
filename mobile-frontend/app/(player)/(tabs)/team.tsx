import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

export default function PlayerTeamScreen() {
  return (
    <SafeAreaView className="flex-1" edges={['bottom']}>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-xl font-semibold text-gray-900 dark:text-white">Team</Text>
      </View>
    </SafeAreaView>
  );
}

