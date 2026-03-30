import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MapPin } from 'phosphor-react-native';
import { addDays, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Stadium } from '@/interfaces/stadium.interface';
import { BookingOptions } from '@/components/stadium/booking/booking-options';
import { CheckoutModal } from '@/components/stadium/booking/checkout-modal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/constants/routes';
import { BookingService } from '@/services/booking.service';
import { WalletService } from '@/services/wallet.service';
import { teamService } from '@/services/team.service';
import { updateBalance } from '@/store/slices/walletSlice';


const generateDays = (referenceDate: Date) => {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  return eachDayOfInterval({ start, end: addDays(start, 6) });
};

const getHoursArray = (stadium: Stadium) => {
  const start = parseInt((stadium.startTime || '08:00').split(':')[0], 10);
  const end = parseInt((stadium.endTime || '23:00').split(':')[0], 10);
  return Array.from({ length: end - start + 1 }, (_, i) => `${(start + i).toString().padStart(2, '0')}:00`);
};

export default function StadiumBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useColorScheme();
  const tint = useThemeColor({}, 'tint');

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<'SOLO' | 'TEAM'>('SOLO');
  const [matchType, setMatchType] = useState<'FULL' | 'HALF'>('FULL');
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [takenSlots, setTakenSlots] = useState<{ scheduledAt: string; matchType: 'FULL' | 'HALF' }[]>([]);
  const [canBookTeam, setCanBookTeam] = useState(false);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [serverTimeSynced, setServerTimeSynced] = useState(false);
  const [days, setDays] = useState<Date[]>([]);

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const walletBalance = useAppSelector((state) => state.wallet.balance);

  const params = useLocalSearchParams<{ id: string; stadium?: string }>();
  const stadium = useMemo<Stadium | null>(() => {
    if (!params.stadium) return null;
    try { return JSON.parse(decodeURIComponent(params.stadium)) as Stadium; }
    catch { return null; }
  }, [params.stadium]);

  useEffect(() => {
    if (stadium?.id) {
      const today = new Date();
      const nextWeek = addDays(today, 6);
      
      BookingService.getTakenSlots(stadium.id, undefined, today.toISOString(), nextWeek.toISOString())
        .then(data => {
          setTakenSlots(data.slots);

          // Calculate time offset to handle manipulated device clock
          const serverTime = new Date(data.currentTime);
          const offset = serverTime.getTime() - new Date().getTime();
          setServerTimeOffset(offset);
          setServerTimeSynced(true);

          // Re-generate days based on server
          const serverDays = generateDays(serverTime);
          setDays(serverDays);
          setSelectedDate(serverTime);
        })
        .catch(console.error);
    }
  }, [stadium?.id]);

  useEffect(() => {
    const checkTeamStatus = async () => {
      if (!user?.id) return;
      try {
        const myTeams = await teamService.getMyTeams();
        const isLeader = myTeams.some(team => team.leaderId === user.id || team.leader?.id === user.id);
        setCanBookTeam(isLeader);
        setBookingType(isLeader ? 'TEAM' : 'SOLO');
      } catch (error) {
        console.error('Error fetching team status:', error);
      }
    };
    checkTeamStatus();
  }, [user?.id]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const walletData = await WalletService.getWallet();
        dispatch(updateBalance(walletData.balance));
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };
    fetchWallet();
  }, [dispatch]);

  useEffect(() => {
    if (!canBookTeam && bookingType === 'TEAM') {
      setBookingType('SOLO');
    }
  }, [canBookTeam, bookingType]);

  const getSlotStatus = (hour: string, date: Date = selectedDate) => {
    const [h, m] = hour.split(':');
    const slotTime = new Date(date);
    slotTime.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

    // Filter slots for the exact same hour and date
    const slotsAtHour = takenSlots.filter(s => new Date(s.scheduledAt).getTime() === slotTime.getTime());

    const hasFull = slotsAtHour.some(s => s.matchType === 'FULL');
    if (hasFull) return 'FULL';

    const halfCount = slotsAtHour.filter(s => s.matchType === 'HALF').length;
    if (halfCount >= 2) return 'FULL';
    if (halfCount === 1) return 'HALF';

    return 'AVAILABLE';
  };

  const isSlotInPast = (hour: string, date: Date = selectedDate) => {
    const [h, m] = hour.split(':');
    const slotTime = new Date(date);
    slotTime.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

    // Compare with server-corrected time
    const correctedNow = new Date().getTime() + serverTimeOffset;
    return slotTime.getTime() < correctedNow;
  };

  const isDayFull = (date: Date) => {
    if (!stadium || !serverTimeSynced) return false;
    const hoursArray = getHoursArray(stadium);
    return hoursArray.every(h => {
      const status = getSlotStatus(h, date);
      const inPast = isSlotInPast(h, date);
      return status === 'FULL' || inPast;
    });
  };

  const hours = useMemo(() => stadium ? getHoursArray(stadium) : [], [stadium]);

  if (!stadium) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <Text>Loading booking session...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-slate-900" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View className="px-5 py-4 flex-row items-center gap-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold dark:text-white">{stadium.name}</Text>
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color="#64748B" />
            <Text className="text-xs text-slate-500">{stadium.city}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>

        {/* ── Mini Calendar Section ── */}
        <View className="mt-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-bold dark:text-white">
              {format(new Date(new Date().getTime() + serverTimeOffset), 'MMMM yyyy')}
            </Text>
          </View>

          {/* Weekday Headers */}
          <View className="flex-row justify-between mb-4">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
              <View key={day} className="w-10 items-center">
                <Text className="text-xs font-bold text-slate-400">{day}</Text>
              </View>
            ))}
          </View>

          {/* Days Grid (Next 7 days correctly aligned) */}
          <View className="flex-row flex-wrap">
            {/* Offset to align first day to its weekday column (0=Mon, 6=Sun) */}
            {days.length > 0 && Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
              <View key={`offset-${i}`} className="w-[14.28%] h-12" />
            ))}

            {days.map((date, i) => {
              const active = isSameDay(date, selectedDate);
              const full = isDayFull(date);
              const isToday = isSameDay(date, new Date(new Date().getTime() + serverTimeOffset));

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setSelectedDate(date);
                    setSelectedHour(null);
                  }}
                  className={`w-[14.28%] h-12 items-center justify-center`}
                >
                  <View className="items-center">
                    <View
                      className={`w-9 h-9 items-center justify-center rounded-full ${active ? '' : 'bg-transparent'}`}
                      style={[
                        active ? { backgroundColor: tint } : {},
                        isToday && !active ? { borderWidth: 1, borderColor: tint } : {}
                      ]}
                    >
                      <Text className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-700 dark:text-slate-200'} ${isSameDay(date, new Date(new Date().getTime() + serverTimeOffset)) && !active ? 'text-primary-500' : ''}`} style={isSameDay(date, new Date(new Date().getTime() + serverTimeOffset)) && !active ? { color: tint } : {}}>
                        {format(date, 'd')}
                      </Text>
                    </View>
                    {/* Full Day Indicator */}
                    {full && (
                      <View className="w-1 h-1 rounded-full bg-red-500 mt-1" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Hour Selection Section ── */}
        <View className="mt-8">
          <Text className="text-lg font-bold mb-4 dark:text-white">Available Hours</Text>
          <View className="flex-row flex-wrap gap-2.5">
            {hours.map((hour, i) => {
              const active = selectedHour === hour;
              const status = getSlotStatus(hour);
              const isFull = status === 'FULL';
              const isHalf = status === 'HALF';

              const isPast = isSlotInPast(hour);
              const isDisabled = !serverTimeSynced || isFull || (isHalf && matchType === 'FULL') || isPast;

              // Auto-clear selection if it becomes past after sync
              if (serverTimeSynced && selectedHour === hour && isPast) {
                setTimeout(() => setSelectedHour(null), 0);
              }

              let borderColor = 'border-slate-100 dark:border-slate-800';
              let indicatorColor = 'bg-emerald-500';

              if (isFull) { borderColor = 'border-red-200 dark:border-red-900/30'; indicatorColor = 'bg-red-500'; }
              else if (isHalf) { borderColor = 'border-amber-200 dark:border-amber-900/30'; indicatorColor = 'bg-amber-500'; }
              else if (isPast) { indicatorColor = 'bg-slate-300 dark:bg-slate-700'; }

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedHour(hour)}
                  disabled={isDisabled}
                  className={`w-[23%] h-14 items-center justify-center rounded-xl border ${borderColor} bg-slate-50 dark:bg-slate-800/40`}
                  style={[
                    active ? { backgroundColor: tint, borderColor: tint } : {},
                    isDisabled ? { opacity: 0.5 } : {}
                  ]}
                >
                  <Text className={`font-semibold ${active ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {hour}
                  </Text>
                  <View className={`w-1.5 h-1.5 rounded-full mt-1 ${active ? 'bg-white' : indicatorColor}`} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Booking Type & Scale Section ── */}
        <BookingOptions
          bookingType={bookingType}
          onBookingTypeChange={setBookingType}
          matchType={matchType}
          onMatchTypeChange={setMatchType}
          tint={tint}
          canBookTeam={canBookTeam}
        />

        {/* ── Selection Summary ── */}
        {selectedHour && (
          <View className="mt-8 p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30"
            style={{ backgroundColor: tint + '10', borderColor: tint + '30' }}>
            <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">Your Selection</Text>
            <Text className="text-lg font-bold mt-1 dark:text-white">
              {format(selectedDate, 'EEEE, MMMM do')}
            </Text>
            <Text className="text-xl font-black mt-1" style={{ color: tint }}>
              at {selectedHour}
            </Text>
          </View>
        )}

      </ScrollView>

      {/* ── Booking Summary & Action ── */}
      <View className="px-5 py-6 border-t border-slate-100 dark:border-slate-800" style={{ paddingBottom: 24 + insets.bottom }}>
        <TouchableOpacity
          onPress={() => setShowCheckout(true)}
          className="h-14 rounded-2xl items-center justify-center flex-row gap-2"
          style={{ backgroundColor: selectedHour ? tint : '#94A3B8' }}
          disabled={!selectedHour}
        >
          <Text className="text-white font-bold text-lg">Continue to Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* ── Checkout Modal ── */}
      {stadium && selectedHour && (
        <CheckoutModal
          visible={showCheckout}
          onClose={() => setShowCheckout(false)}
          loading={loading}
          onConfirm={async () => {
            setLoading(true);
            try {
              const [h, m] = selectedHour.split(':');
              const scheduledAt = new Date(selectedDate);
              scheduledAt.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

              const correctedNow = new Date().getTime() + serverTimeOffset;
              if (scheduledAt.getTime() < correctedNow) {
                Alert.alert('Error', 'Cannot book a time in the past.');
                setLoading(false);
                return;
              }

              await BookingService.create({
                stadiumId: stadium.id,
                scheduledAt: scheduledAt.toISOString(),
                matchType: matchType,
              });

              // Refresh wallet balance
              const walletData = await WalletService.getWallet();
              dispatch(updateBalance(walletData.balance));

              setShowCheckout(false);
              router.replace(ROUTES.PLAYER_WALLET);
            } catch (error: any) {
              console.error('Booking failed:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to complete booking.');
            } finally {
              setLoading(false);
            }
          }}
          bookingData={{
            stadium: stadium,
            date: selectedDate,
            hour: selectedHour,
            bookingType: bookingType,
            matchType: matchType,
            totalAmount: matchType === 'FULL' ? stadium.priceFullMatch : stadium.priceHalfMatch,
            walletBalance: walletBalance,
          }}
        />
      )}
    </View>
  );
}
