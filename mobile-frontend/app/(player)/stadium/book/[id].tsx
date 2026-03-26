import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CaretLeft, MapPin } from 'phosphor-react-native';
import { addDays, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Stadium } from '@/interfaces/stadium.interface';


const DAYS = eachDayOfInterval({ start: new Date(), end: addDays(new Date(), 6) });

const getHoursArray = (stadium: Stadium) => {
  const start = parseInt((stadium.startTime || '08:00').split(':')[0], 10);
  const end = parseInt((stadium.endTime || '23:00').split(':')[0], 10);
  return Array.from({ length: end - start + 1 }, (_, i) => `${(start + i).toString().padStart(2, '0')}:00`);
};

// Helper to generate next 7 days using date-fns
function generateNext7Days() {
  const today = new Date();
  const nextWeek = addDays(today, 6);
  const days = eachDayOfInterval({
    start: today,
    end: nextWeek,
  });
  return days;
}

export default function StadiumBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useColorScheme();
  const tint = useThemeColor({}, 'tint');
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const params = useLocalSearchParams<{ id: string; stadium?: string }>();
  const stadium = useMemo<Stadium | null>(() => {
    if (!params.stadium) return null;
    try { return JSON.parse(decodeURIComponent(params.stadium)) as Stadium; }
    catch { return null; }
  }, [params.stadium]);

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
            <Text className="text-lg font-bold dark:text-white">{format(new Date(), 'MMMM yyyy')}</Text>
            <View className="flex-row gap-4">
              <IconSymbol name="chevron.left" size={16} color="#94A3B8" />
              <IconSymbol name="chevron.right" size={16} color={tint} />
            </View>
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
            {Array.from({ length: (DAYS[0].getDay() + 6) % 7 }).map((_, i) => (
              <View key={`offset-${i}`} className="w-[14.28%] h-10" />
            ))}

            {DAYS.map((date, i) => {
              const active = isSameDay(date, selectedDate);
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setSelectedDate(date);
                    setSelectedHour(null);
                  }}
                  className={`w-[14.28%] h-10 items-center justify-center`}
                >
                  <View className={`w-9 h-9 items-center justify-center rounded-full ${active ? '' : 'bg-transparent'}`} style={active ? { backgroundColor: tint } : {}}>
                    <Text className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                      {format(date, 'd')}
                    </Text>
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
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedHour(hour)}
                    className="w-[23%] h-11 items-center justify-center rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                    style={active ? { backgroundColor: tint, borderColor: tint } : {}}
                  >
                    <Text className={`font-semibold ${active ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {hour}
                    </Text>
                  </TouchableOpacity>
                );
              })}
           </View>
        </View>

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
           className="h-14 rounded-2xl items-center justify-center flex-row gap-2"
           style={{ backgroundColor: selectedHour ? tint : '#94A3B8' }}
           disabled={!selectedHour}
         >
           <Text className="text-white font-bold text-lg">Continue to Checkout</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}
