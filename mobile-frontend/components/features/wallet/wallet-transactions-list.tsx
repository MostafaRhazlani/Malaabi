import { Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface WalletTransactionsListProps {
  transactions: any[];
}

const formatMoney = (value: number) => `${value.toLocaleString()} MAD`;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function WalletTransactionsList({ transactions }: WalletTransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <View className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 items-center border border-dashed border-slate-200 dark:border-slate-800">
        <IconSymbol name="tray" size={32} color="#94a3b8" />
        <Text className="text-slate-400 dark:text-slate-500 mt-4 font-medium">No transactions yet</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {transactions.map((transaction) => {
        const isCredit = transaction.type === 'TOP_UP' || transaction.type === 'REFUND';
        const iconName = isCredit ? 'plus.circle.fill' : 'minus';
        const color = isCredit ? '#10b981' : '#f43f5e';
        const fallbackLabel =
          transaction.type === 'TOP_UP'
            ? 'Top Up'
            : transaction.type === 'REFUND'
              ? 'Refund'
              : transaction.type === 'PAYMENT'
                ? 'Payment'
                : 'Deduction';

        return (
          <View
            key={transaction.id}
            className="flex-row items-center justify-between py-1"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 items-center justify-center mr-4 border border-slate-100 dark:border-slate-800">
                <IconSymbol name={iconName} size={22} color={color} />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-slate-900 dark:text-white font-bold text-base" numberOfLines={1}>
                  {transaction.description || fallbackLabel}
                </Text>
                <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                  {formatDate(transaction.createdAt)}
                </Text>
              </View>
            </View>

            <View className="items-end">
              <Text className={`text-lg font-black ${isCredit ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                {isCredit ? '+' : '-'}{formatMoney(transaction.amount)}
              </Text>
              <View className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1">
                 <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                   {transaction.type}
                 </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
