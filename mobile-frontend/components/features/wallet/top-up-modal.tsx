import { Modal, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';

interface TopUpModalProps {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onContinue: (amount: number, methodLabel: string) => void;
}

const METHODS = [
  { id: 'APPLE_PAY', label: 'Apple Pay', icon: 'sportscourt.fill' as IconSymbolName }, // Mocked icons
  { id: 'DEBIT_CARD', label: 'Debit Card', icon: 'creditcard.fill' as IconSymbolName },
  { id: 'MANUAL_TRANSFER', label: 'Bank Transfer', icon: 'tray' as IconSymbolName },
] as const;

export function TopUpModal({ visible, loading, onClose, onContinue }: TopUpModalProps) {
  const insets = useSafeAreaInsets();
  const [amountInput, setAmountInput] = useState('100');
  const [selectedMethod, setSelectedMethod] = useState<(typeof METHODS)[number]['id']>('DEBIT_CARD');

  useEffect(() => {
    if (visible) {
      setAmountInput('100');
    }
  }, [visible]);

  const handleAmountChange = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, '');
    setAmountInput(digitsOnly.length ? digitsOnly : '0');
  };

  const amount = Number(amountInput);
  const isDisabled = !Number.isFinite(amount) || amount <= 0 || loading;

  const handleContinue = () => {
    if (isDisabled) return;
    const method = METHODS.find((item) => item.id === selectedMethod)?.label ?? 'Wallet top up';
    onContinue(amount, method);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white dark:bg-slate-900 rounded-t-[40px] overflow-hidden" style={{ paddingBottom: insets.bottom + 20 }}>
          <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full self-center mt-3 mb-2" />
          
          <View className="px-6 pt-4">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-black text-slate-900 dark:text-white">Add Funds</Text>
              <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                <IconSymbol name="xmark" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 items-center border border-slate-100 dark:border-slate-800 mb-6">
              <Text className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Enter Amount (MAD)</Text>
              <View className="flex-row items-center">
                <Text className="text-4xl font-black text-theme-light-tint dark:text-theme-dark-tint mr-2">MAD</Text>
                <TextInput
                  value={amountInput}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  className="text-5xl font-black text-slate-900 dark:text-white min-w-[100px]"
                  placeholder="0"
                  autoFocus
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <Text className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs mb-4 ml-1">Payment Method</Text>
            <View className="gap-3 mb-8">
              {METHODS.map(({ id, label, icon }) => {
                const selected = selectedMethod === id;
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => setSelectedMethod(id)}
                    className={`flex-row items-center justify-between p-4 rounded-2xl border ${selected ? 'border-theme-light-tint dark:border-theme-dark-tint bg-theme-light-tint/5 dark:bg-theme-dark-tint/5' : 'border-slate-100 dark:border-slate-800'}`}
                  >
                    <View className="flex-row items-center">
                      <View className={`w-10 h-10 rounded-xl items-center justify-center ${selected ? 'bg-theme-light-tint dark:bg-theme-dark-tint' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <IconSymbol name={icon} size={20} color={selected ? '#000' : '#94A3B8'} />
                      </View>
                      <Text className={`ml-4 text-lg font-bold ${selected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{label}</Text>
                    </View>
                    {selected && <IconSymbol name="checkmark.circle.fill" size={24} color="#10b981" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              disabled={isDisabled}
              className={`h-16 rounded-2xl items-center justify-center flex-row ${isDisabled ? 'bg-slate-200 dark:bg-slate-800' : 'bg-theme-light-tint dark:bg-theme-dark-tint shadow-lg shadow-emerald-500/20'}`}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <IconSymbol name="checkmark" size={20} color="#000" />
                  <Text className="text-[#000] font-black text-lg ml-2">Confirm Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
