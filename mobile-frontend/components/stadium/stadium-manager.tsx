import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ChatCircle, Phone } from 'phosphor-react-native';

const MANAGER_AVATAR = 'https://i.pravatar.cc/150?img=11';

export function StadiumManager({ tint }: { tint: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Image source={{ uri: MANAGER_AVATAR }} className="w-12 h-12 rounded-full" resizeMode="cover" />
        <View>
          <Text className="text-sm font-bold text-slate-900 dark:text-white">Ahmed Hassan</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">Manager</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 items-center justify-center">
          <ChatCircle size={18} color={tint} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 items-center justify-center">
          <Phone size={18} color={tint} weight="regular" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
