import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GuardService, GuardBooking } from '@/services/guard.service';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { BASE_URL } from '@/services/api';

import { FilterBar } from '@/components/ui/filter-bar';

const FILTERS = ['All', 'Pending', 'Confirmed'];

export default function GuardBookingsScreen() {
  const [bookings, setBookings] = useState<GuardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  
  const fetchBookings = async () => {
    try {
      const data = await GuardService.getStadiumBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching guard bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(b => {
    if (activeFilter === 'All') return true;
    return b.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-theme-light-background dark:bg-theme-dark-background">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-theme-light-background dark:bg-theme-dark-background">
      <FilterBar 
        filters={FILTERS} 
        activeFilter={activeFilter} 
        onFilterPress={setActiveFilter} 
      />
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GuardBookingCard booking={item} />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22C55E" />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-40 px-10">
               <View className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                  <IconSymbol name="rectangle.stack.fill" size={28} color="#94A3B8" />
               </View>
              <Text className="text-slate-400 dark:text-slate-500 text-center font-medium">
                No bookings found for your stadium today.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

function GuardBookingCard({ booking }: { booking: GuardBooking }) {
  const playerImage = booking.player.profile_img?.startsWith('http') 
    ? booking.player.profile_img 
    : `${BASE_URL}${booking.player.profile_img}`;

  const date = new Date(booking.scheduledAt);
  const isConfirmed = booking.status === 'CONFIRMED';
  const isExpired = booking.status === 'EXPIRED';

  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-700/50 shadow-sm">
      <View className="flex-row items-center gap-3">
        {/* Player Avatar */}
        <Image 
          source={{ uri: playerImage }} 
          className="w-12 h-12 rounded-full bg-slate-100" 
          contentFit="cover"
        />
        
        {/* Player & Status */}
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900 dark:text-white">
            {booking.player.first_name} {booking.player.last_name}
          </Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            <View className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
              <Text className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{booking.matchType}</Text>
            </View>
            <View className={`px-2 py-0.5 rounded-md ${isConfirmed ? 'bg-emerald-100 dark:bg-emerald-500/20' : isExpired ? 'bg-rose-100 dark:bg-rose-500/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}>
               <Text className={`text-[10px] font-bold ${isConfirmed ? 'text-emerald-700 dark:text-emerald-400' : isExpired ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
                 {booking.status}
               </Text>
            </View>
          </View>
        </View>

        {/* Time */}
        <View className="items-end">
          <Text className="text-lg font-black text-slate-900 dark:text-white">
             {format(date, 'HH:mm')}
          </Text>
          <Text className="text-[10px] font-bold text-slate-400">{format(date, 'EEE, d MMM')}</Text>
        </View>
      </View>
      
      {/* Verification Code Footer if Pending */}
      {!isConfirmed && !isExpired && (
        <View className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-700/50 flex-row items-center justify-between">
           <Text className="text-[10px] font-medium text-slate-400">Awaiting QR scan...</Text>
           <View className="bg-emerald-500/10 px-2 py-1 rounded-md">
              <Text className="text-[10px] font-black text-emerald-600 uppercase">Awaiting</Text>
           </View>
        </View>
      )}
    </View>
  );
}
