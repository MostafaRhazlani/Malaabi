import { Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface WalletBalanceCardProps {
  balance: number;
  onTopUpPress: () => void;
}

const formatCurrency = (value: number) => `${value.toLocaleString()} MAD`;

export function WalletBalanceCard({ balance, onTopUpPress }: WalletBalanceCardProps) {
  return (
    <View className="bg-slate-900 dark:bg-slate-900 rounded-[32px] p-6 border border-white/5 overflow-hidden">
      {/* Background patterns could go here */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white/60 text-sm font-semibold uppercase tracking-wider">Total Balance</Text>
        <View className="bg-white/10 p-2 rounded-full">
           <IconSymbol name="creditcard.fill" size={20} color="#FFFFFF" />
        </View>
      </View>
      
      <Text className="text-white text-5xl font-black mb-6">{formatCurrency(balance)}</Text>
      
      <TouchableOpacity
        onPress={onTopUpPress}
        className="h-14 rounded-2xl bg-theme-light-tint dark:bg-theme-dark-tint items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <IconSymbol name="plus" size={18} color="#000" />
          <Text className="text-[#000] font-black text-lg ml-2">Top up Account</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
