import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProfileWalletMenuProps {
  onPressWallet: () => void;
}

export function ProfileWalletMenu({ onPressWallet }: ProfileWalletMenuProps) {
  const { isDark } = useColorScheme();

  return (
    <View className="bg-theme-light-card dark:bg-theme-dark-card rounded-3xl p-3 border border-slate-100 dark:border-slate-800 mt-4">
      <TouchableOpacity
        onPress={onPressWallet}
        activeOpacity={0.8}
        className="flex-row items-center justify-between rounded-2xl px-4 py-4 bg-slate-50 dark:bg-slate-800/70"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-xl bg-theme-light-tint/15 dark:bg-theme-dark-tint/20 items-center justify-center">
            <IconSymbol name="tray" size={20} color={isDark ? '#86EFAC' : '#16A34A'} />
          </View>
          <View className="ml-3">
            <Text className="text-base font-bold text-slate-900 dark:text-white">Wallet</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">View balance and transactions</Text>
          </View>
        </View>

        <IconSymbol name="chevron.right" size={18} color={isDark ? '#CBD5E1' : '#64748B'} />
      </TouchableOpacity>
    </View>
  );
}
