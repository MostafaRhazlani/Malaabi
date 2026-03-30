import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface BookingOptionsProps {
  bookingType: 'SOLO' | 'TEAM';
  onBookingTypeChange: (type: 'SOLO' | 'TEAM') => void;
  matchType: 'FULL' | 'HALF';
  onMatchTypeChange: (type: 'FULL' | 'HALF') => void;
  tint: string;
  canBookTeam?: boolean;
}

export const BookingOptions: React.FC<BookingOptionsProps> = ({
  bookingType,
  onBookingTypeChange,
  matchType,
  onMatchTypeChange,
  tint,
  canBookTeam = false,
}) => {
  return (
    <View className="mt-8 gap-y-6">
      {/* Booking Type: Solo vs Team */}
      <View>
        <Text className="text-lg font-bold mb-4 dark:text-white">Who are you booking for?</Text>
        <View className="flex-row">
          {canBookTeam ? (
            <View
              className="flex-1 flex-row items-center justify-center p-4 rounded-2xl border-2"
              style={{ borderColor: tint, backgroundColor: tint + '10' }}
            >
              <IconSymbol name="person.3.fill" size={20} color={tint} />
              <Text className="ml-2 font-bold text-slate-900 dark:text-white">Booking for My Team</Text>
            </View>
          ) : (
            <View
              className="flex-1 flex-row items-center justify-center p-4 rounded-2xl border-2"
              style={{ borderColor: tint, backgroundColor: tint + '10' }}
            >
              <IconSymbol name="person.fill" size={20} color={tint} />
              <Text className="ml-2 font-bold text-slate-900 dark:text-white">Solo Match</Text>
            </View>
          )}
        </View>
      </View>

      {/* Match Type: Full vs Half */}
      <View>
        <Text className="text-lg font-bold mb-4 dark:text-white">Match Scale</Text>
        <View className="flex-row gap-x-3">
          <TouchableOpacity
            onPress={() => onMatchTypeChange('FULL')}
            className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border-2 ${matchType === 'FULL' ? '' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'}`}
            style={matchType === 'FULL' ? { borderColor: tint, backgroundColor: tint + '10' } : {}}
          >
            <IconSymbol name="soccer.ball.fill" size={20} color={matchType === 'FULL' ? tint : '#94A3B8'} />
            <View className="ml-2">
               <Text className={`font-bold ${matchType === 'FULL' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Full Pitch</Text>
               <Text className="text-[10px] text-slate-400">Total match experience</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onMatchTypeChange('HALF')}
            className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border-2 ${matchType === 'HALF' ? '' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'}`}
            style={matchType === 'HALF' ? { borderColor: tint, backgroundColor: tint + '10' } : {}}
          >
            <IconSymbol name="rectangle.grid.2x2.fill" size={20} color={matchType === 'HALF' ? tint : '#94A3B8'} />
            <View className="ml-2">
               <Text className={`font-bold ${matchType === 'HALF' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Half Pitch</Text>
               <Text className="text-[10px] text-slate-400">Smaller game scale</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
