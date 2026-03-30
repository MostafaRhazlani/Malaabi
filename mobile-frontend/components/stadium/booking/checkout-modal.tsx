import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  bookingData: {
    stadium: any;
    date: Date;
    hour: string;
    bookingType: 'SOLO' | 'TEAM';
    matchType: 'FULL' | 'HALF';
    totalAmount: number;
    walletBalance: number;
  };
  onConfirm: () => void;
  loading?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  visible,
  onClose,
  bookingData,
  onConfirm,
  loading,
}) => {
  const insets = useSafeAreaInsets();
  const { stadium, date, hour, bookingType, matchType, totalAmount, walletBalance } = bookingData;
  const hasEnoughFunds = walletBalance >= totalAmount;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white dark:bg-slate-900 rounded-t-[40px] px-6" style={{ paddingBottom: insets.bottom + 20, paddingTop: 20 }}>
          <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full self-center mb-6" />
          
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-2xl font-black dark:text-white">Booking Details</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
              <IconSymbol name="xmark" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
             {/* Summary Section */}
             <View className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-6">
                <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Reservation Info</Text>
                
                <View className="gap-y-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-500 font-bold">Stadium</Text>
                    <Text className="font-bold dark:text-white">{stadium.name}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-500 font-bold">Date & Time</Text>
                    <Text className="font-bold dark:text-white">{format(date, 'MMM d, yyyy')} @ {hour}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-500 font-bold">Booking Type</Text>
                    <View className="bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full">
                       <Text className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">{bookingType}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-500 font-bold">Match Scale</Text>
                    <View className={`px-3 py-1 rounded-full ${matchType === 'FULL' ? 'bg-amber-50 dark:bg-amber-900/40' : 'bg-emerald-50 dark:bg-emerald-900/40'}`}>
                       <Text className={`text-[10px] font-black uppercase ${matchType === 'FULL' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{matchType} PITCH</Text>
                    </View>
                  </View>
                </View>

                <View className="h-px bg-slate-200 dark:bg-slate-700 my-4" />

                <View className="flex-row items-center justify-between">
                   <Text className="text-lg font-bold dark:text-white">Total Amount</Text>
                   <Text className="text-xl font-black text-theme-light-tint dark:text-theme-dark-tint">{totalAmount} MAD</Text>
                </View>
             </View>

             {/* Payment Info */}
             <View className={`p-6 rounded-3xl border ${hasEnoughFunds ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/40'}`}>
                <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Payment Summary</Text>
                <View className="flex-row items-center justify-between mb-2">
                   <Text className="text-slate-500">Wallet Balance</Text>
                   <Text className="font-bold dark:text-white">{walletBalance} MAD</Text>
                </View>
                {!hasEnoughFunds && (
                  <Text className="text-xs font-bold text-red-500 mt-2">
                    ⚠️ Insufficient balance to complete this booking.
                  </Text>
                )}
             </View>
          </ScrollView>

          <View className="mt-8">
             <TouchableOpacity
                onPress={onConfirm}
                disabled={!hasEnoughFunds || loading}
                className={`h-16 rounded-3xl items-center justify-center flex-row gap-2 ${hasEnoughFunds ? 'bg-theme-light-tint dark:bg-theme-dark-tint' : 'bg-slate-200 dark:bg-slate-800'}`}
             >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <IconSymbol name="creditcard.fill" size={20} color="#000" />
                    <Text className="font-black text-lg text-black">Confirm & Pay</Text>
                  </>
                )}
             </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
