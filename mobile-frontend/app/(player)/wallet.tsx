import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { WalletBalanceCard } from '@/components/features/wallet/wallet-balance-card';
import { WalletTransactionsList } from '@/components/features/wallet/wallet-transactions-list';
import { TopUpModal } from '@/components/features/wallet/top-up-modal';
import { WalletService } from '@/services/wallet.service';
import { setWallet, updateBalance, setLoading } from '@/store/slices/walletSlice';

export default function PlayerWalletScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isDark } = useColorScheme();
  const { balance, transactions, loading } = useAppSelector((state) => state.wallet);
  const [isTopUpVisible, setTopUpVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWalletData = async () => {
    try {
      const walletData = await WalletService.getWallet();
      dispatch(setWallet({
        balance: walletData.balance,
        transactions: walletData.transactions || [],
      }));
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchWalletData();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const handleTopUp = async (amount: number, methodLabel: string) => {
    dispatch(setLoading(true));
    try {
      const updatedWallet = await WalletService.topUp(amount, `Top up via ${methodLabel}`);
      dispatch(updateBalance(updatedWallet.balance));
      await fetchWalletData(); // Refresh transactions
      setTopUpVisible(false);
      Alert.alert('Success', `Successfully topped up ${amount} MAD!`);
    } catch (error) {
      console.error('Top up failed:', error);
      Alert.alert('Error', 'Failed to complete top up.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const themeColors = isDark ? Colors.dark : Colors.light;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950" edges={['top', 'bottom']}>
      <View className="px-6 py-4 flex-row items-center border-b border-slate-50 dark:border-slate-900/50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <IconSymbol name="chevron.left" size={20} color={themeColors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900 dark:text-white ml-4">My Wallet</Text>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#fff' : '#000'} />
        }
      >
        <View className="p-6">
          <WalletBalanceCard 
            balance={balance} 
            onTopUpPress={() => setTopUpVisible(true)} 
          />
          
          <View className="mt-8">
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Transactions</Text>
            <WalletTransactionsList transactions={transactions} />
          </View>
        </View>
      </ScrollView>

      <TopUpModal
        visible={isTopUpVisible}
        loading={loading}
        onClose={() => setTopUpVisible(false)}
        onContinue={handleTopUp}
      />
    </SafeAreaView>
  );
}
