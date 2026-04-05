import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookingService, Booking } from '@/services/booking.service';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { format } from 'date-fns';
import { BASE_URL } from '@/services/api';
import { Image } from 'expo-image';
import { CustomHeader } from '@/components/ui/custom-header';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FilterBar } from '@/components/ui/filter-bar';
import { TicketModal } from '@/components/features/bookings/ticket-modal';

const FILTERS = ['Upcoming', 'History'];

export default function PlayerBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Upcoming');
  
  // Ticket Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [ticketVisible, setTicketVisible] = useState(false);
  
  const searchQuery = useSelector((state: RootState) => state.search.bookings);

  const fetchBookings = async () => {
    try {
      const data = await BookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const today = new Date();
    return bookings.filter(b => {
      const isPast = new Date(b.scheduledAt) < today;
      const matchesTab = activeFilter === 'Upcoming' ? !isPast : isPast;
      const matchesSearch = !searchQuery || 
        b.stadium.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.stadium.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesTab && matchesSearch;
    });
  }, [bookings, activeFilter, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handlePressBooking = (booking: Booking) => {
    if (booking.status === 'PENDING') {
      setSelectedBooking(booking);
      setTicketVisible(true);
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    const now = new Date();
    const scheduled = new Date(booking.scheduledAt);
    const diffHours = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);
    const refundPercent = diffHours >= 4 ? 100 : 50;

    Alert.alert(
      "Cancel Match?",
      `Matches cancelled more than 4 hours in advance get a 100% refund. Late cancellations get 50%.\n\nYou will receive a ${refundPercent}% refund.`,
      [
        { text: "Keep Booking", style: "cancel" },
        { 
          text: "Confirm Cancellation", 
          style: "destructive",
          onPress: async () => {
             setLoading(true);
             try {
                await BookingService.cancelBooking(booking.id);
                fetchBookings();
                Alert.alert("Success", `Booking cancelled. ${refundPercent}% has been refunded to your wallet.`);
             } catch (error: any) {
                const msg = error.response?.data?.message || "Could not cancel booking";
                Alert.alert("Error", msg);
             } finally {
                setLoading(false);
             }
          }
        }
      ]
    );
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
      <CustomHeader 
         title={activeFilter === 'Upcoming' ? "Bookings" : "Matches History"} 
         routeName={activeFilter === 'Upcoming' ? 'bookings' : 'bookings-history'} 
      />

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
            <BookingCard 
              booking={item} 
              onPress={() => handlePressBooking(item)} 
              onCancel={() => handleCancelBooking(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22C55E" />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-40 px-10">
               <View className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                  <IconSymbol name="ticket" size={28} color="#94A3B8" />
               </View>
              <Text className="text-slate-400 dark:text-slate-500 text-center font-medium">
                {activeFilter === 'Upcoming' ? "No upcoming matches found." : "No past match history."}
              </Text>
            </View>
          }
        />
      </SafeAreaView>

      <TicketModal 
        visible={ticketVisible} 
        onClose={() => setTicketVisible(false)} 
        booking={selectedBooking} 
      />
    </View>
  );
}

function BookingCard({ booking, onPress, onCancel }: { booking: Booking, onPress: () => void, onCancel: () => void }) {
  const stadiumImage = booking.stadium.images?.[0] 
    ? `${BASE_URL}${booking.stadium.images[0]}` 
    : 'https://images.unsplash.com/photo-1518605368461-1e1e111e1ebc?w=400';

  const date = new Date(booking.scheduledAt);
  const isPending = booking.status === 'PENDING';

  return (
    <View className="bg-white dark:bg-slate-800 rounded-3xl p-4 mb-4 border border-slate-100 dark:border-slate-700/50 shadow-sm">
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={onPress}
        className="flex-row gap-4"
      >
        {/* Stadium Image Thumbnail */}
        <Image 
          source={{ uri: stadiumImage }} 
          className="w-20 h-20 rounded-2xl bg-slate-100" 
          contentFit="cover"
        />
        
        {/* Info */}
        <View className="flex-1 justify-between py-1">
          <View>
            <Text className="text-base font-bold text-slate-900 dark:text-white" numberOfLines={1}>
              {booking.stadium.name}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <IconSymbol name="map.fill" size={12} color="#94A3B8" />
              <Text className="text-xs text-slate-500 dark:text-slate-400">{booking.stadium.city}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-auto">
            <View className="flex-row items-center gap-1.5">
               <View className="bg-emerald-100 dark:bg-emerald-500/20 px-2 py-1 rounded-lg">
                  <Text className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">{booking.matchType}</Text>
               </View>
               <Text className="text-xs font-bold text-slate-900 dark:text-white">{booking.totalAmount} DH</Text>
            </View>
            <View className={`px-2 py-1 rounded-lg ${isPending ? 'bg-amber-100 dark:bg-amber-500/20' : booking.status === 'EXPIRED' ? 'bg-rose-100 dark:bg-rose-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <Text className={`text-[10px] font-black uppercase ${isPending ? 'text-amber-600 dark:text-amber-400' : booking.status === 'EXPIRED' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>{booking.status}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <View className="h-px bg-slate-50 dark:bg-zinc-800 my-4" />

      {/* Footer Actions */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <IconSymbol name="calendar" size={14} color="#22C55E" />
            <Text className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {format(date, 'EEE, d MMM')}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <IconSymbol name="clock.fill" size={14} color="#22C55E" />
            <Text className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {format(date, 'HH:mm')}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center gap-2">
            {isPending && (
              <TouchableOpacity
                onPress={onCancel}
                className="bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-full border border-rose-100 dark:border-rose-500/20"
              >
                <Text className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase">Cancel</Text>
              </TouchableOpacity>
            )}
            
            {isPending && (
               <TouchableOpacity
                 onPress={onPress}
                 className="bg-emerald-500 px-3 py-2 rounded-full shadow-sm shadow-emerald-500/40"
               >
                 <Text className="text-[10px] font-black text-white uppercase">View Ticket</Text>
               </TouchableOpacity>
            )}
        </View>
      </View>
    </View>
  );
}
