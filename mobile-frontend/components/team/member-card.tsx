import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { differenceInYears } from 'date-fns';
import { BASE_URL } from '@/services/api';
import { IconSymbol } from '@/components/ui/icon-symbol';

export interface MemberCardProps {
  member: any;
  isRequest?: boolean;
  isExpellable?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onExpel?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  isActionLoading?: boolean;
  actionVariant?: 'primary' | 'danger' | 'secondary';
}

const calculateAge = (birthDate?: string | Date) => {
  if (!birthDate) return 'N/A';
  const birth = new Date(birthDate);
  const now = new Date();
  return differenceInYears(now, birth);
};

export const MemberCard = React.memo(
  ({
    member = {},
    isRequest,
    isExpellable,
    onAccept,
    onReject,
    onExpel,
    actionLabel,
    onAction,
    isActionLoading,
    actionVariant = 'primary',
  }: MemberCardProps) => {
  const { 
    first_name = '', 
    last_name = '', 
    profile_img, 
    position = 'PLAYER', 
    birth_date,
    team 
  } = member;

  const avatar = profile_img
    ? { uri: `${BASE_URL}${profile_img}` }
    : { uri: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png' };

  return (
    <View className="bg-theme-light-card dark:bg-theme-dark-card p-4 flex-row items-center border-b border-slate-100 dark:border-slate-800">
      <View className="w-14 h-14 items-center justify-center mr-4">
        <Image
          source={avatar}
          style={{ width: 56, height: 56, borderRadius: 16 }}
          contentFit="contain"
        />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold dark:text-white" numberOfLines={1}>
          {first_name} {last_name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs text-slate-500 dark:text-slate-400 uppercase font-black">
            {position || 'player'}
          </Text>
          <Text className="text-slate-300 dark:text-slate-600 mx-2">•</Text>
          <Text className="text-slate-400 dark:text-slate-500 text-[12px]">
            {calculateAge(birth_date)} years old
          </Text>
        </View>
        {team && (
          <View className="flex-row items-center mt-1">
             <IconSymbol name="person.2.fill" size={12} color="#94A3B8" />
             <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold ml-1 italic">
                {team.name}
             </Text>
          </View>
        )}
      </View>
      {isRequest && (
        <View className="flex-row gap-x-2">
          <TouchableOpacity 
            onPress={onReject} 
            className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full items-center justify-center"
          >
            <IconSymbol name="xmark" size={18} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onAccept} 
            className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-full items-center justify-center"
          >
            <IconSymbol name="checkmark" size={18} color="#22C55E" />
          </TouchableOpacity>
        </View>
      )}
      {!isRequest && isExpellable && (
        <TouchableOpacity
          onPress={onExpel}
          className="h-9 rounded-full bg-red-50 px-3 items-center justify-center dark:bg-red-900/20"
        >
          <Text className="text-[10px] font-black tracking-wider text-red-500 dark:text-red-400">
            EXPEL
          </Text>
        </TouchableOpacity>
      )}
      {!isRequest && !isExpellable && actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          disabled={Boolean(isActionLoading)}
          className={`h-9 px-3 items-center justify-center rounded-xl ${
            actionVariant === 'danger'
              ? 'bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-900/40'
              : 'bg-theme-light-tint dark:bg-theme-dark-tint shadow-sm'
          }`}
        >
          {isActionLoading ? (
            <ActivityIndicator
              size="small"
              color={actionVariant === 'danger' ? '#EF4444' : '#FFFFFF'}
            />
          ) : (
            <Text
              className={`text-[10px] font-black tracking-wider uppercase ${
                actionVariant === 'danger'
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-white dark:text-black'
              }`}
            >
              {actionLabel}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
  },
);

MemberCard.displayName = "MemberCard";
