import React from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { format } from 'date-fns';
import { Booking } from '@/services/booking.service';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import { BASE_URL } from '@/services/api';

interface TicketModalProps {
  visible: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export function TicketModal({ visible, onClose, booking }: TicketModalProps) {
  if (!booking) return null;

  const stadiumImage = booking.stadium.images?.[0] 
    ? `${BASE_URL}${booking.stadium.images[0]}` 
    : 'https://images.unsplash.com/photo-1518605368461-1e1e111e1ebc?w=400';

  const date = new Date(booking.scheduledAt);
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <TouchableOpacity 
           activeOpacity={1} 
           onPress={onClose} 
           className="flex-1"
        />
        
        <View className="bg-white dark:bg-slate-900 rounded-t-[40px] px-6 pt-10 pb-12 shadow-2xl">
          <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full self-center mb-8" />
          
          <Text className="text-2xl font-black text-slate-900 dark:text-white text-center mb-1">Your Match Pass</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-center mb-8 font-medium">Show this QR at the stadium gate</Text>
          
          {/* Ticket Card */}
          <View className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800">
             {/* Thumbnail + Name Header */}
             <View className="flex-row items-center p-4 gap-4">
                <Image source={{ uri: stadiumImage }} className="w-14 h-14 rounded-2xl bg-slate-200" contentFit="cover" />
                <View className="flex-1">
                   <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>{booking.stadium.name}</Text>
                   <Text className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{booking.matchType} MATCH • {booking.totalAmount} DH</Text>
                </View>
             </View>

             <View className="h-px bg-slate-200 dark:bg-slate-800 mx-4 border-dashed" />

             {/* QR Section */}
             <View className="items-center justify-center p-8 bg-white dark:bg-slate-900/40 rounded-3xl m-4 border border-slate-100 dark:border-slate-800">
                <QRCode
                  value={booking.verificationToken}
                  size={200}
                  color={textColor}
                  backgroundColor="transparent"
                  logoSize={50}
                  logoMargin={10}
                  logoBorderRadius={15}
                  logoBackgroundColor='white'
                />
                <Text className="text-[10px] text-slate-400 dark:text-slate-600 mt-6 font-mono tracking-widest">{booking.verificationToken.toUpperCase()}</Text>
             </View>

             {/* Details Footer */}
             <View className="flex-row p-4 gap-4 bg-slate-100/50 dark:bg-slate-800/80">
                <DetailItem icon="calendar" label="DATE" value={format(date, 'EEE, d MMM')} />
                <DetailItem icon="clock.fill" label="TIME" value={format(date, 'HH:mm')} />
                <DetailItem icon="map.fill" label="CITY" value={booking.stadium.city} />
             </View>
          </View>

          <TouchableOpacity 
             onPress={onClose}
             className="mt-8 bg-emerald-500 py-5 rounded-3xl shadow-lg shadow-emerald-500/30 items-center justify-center"
          >
             <Text className="text-white font-black text-lg tracking-wide uppercase">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
   return (
      <View className="flex-1">
         <Text className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-tighter">{label}</Text>
         <View className="flex-row items-center gap-1.5">
            <IconSymbol name={icon} size={14} color="#22C55E" />
            <Text className="text-xs font-bold text-slate-700 dark:text-slate-300" numberOfLines={1}>{value}</Text>
         </View>
      </View>
   )
}
