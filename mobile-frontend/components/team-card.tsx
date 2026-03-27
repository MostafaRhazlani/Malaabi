import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Team } from '@/interfaces/team.interface';
import { Image } from 'expo-image';
import { BASE_URL } from '@/services/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface TeamCardProps {
  team: Team;
  onPress?: (team: Team) => void;
}

export function TeamCard({ team, onPress }: TeamCardProps) {
  const { isDark } = useColorScheme();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isLeader = currentUser?.id === team.leader?.id;
  const isMember = team.members?.some(m => m.id === currentUser?.id) || isLeader;
  const isAuthorized = isLeader || isMember;

  const imageSource = team.logo ? { uri: `${BASE_URL}${team.logo}` } : team.image;

  const memberCount = team._count?.members || team.members?.length || 0;
  const leaderName = team.leader ? `${team.leader.first_name} ${team.leader.last_name}` : 'Unknown';

  const Wrapper = (isAuthorized ? TouchableOpacity : View) as any;

  return (
    <Wrapper
      activeOpacity={isAuthorized ? 0.7 : 1}
      onPress={() => isAuthorized && onPress?.(team)}
      className="bg-theme-light-card dark:bg-theme-dark-card p-4 flex-row items-center border-b border-slate-100 dark:border-slate-700"
    >
      <View
        className="w-14 h-14 items-center justify-center mr-4"
      >
        <Image
          source={imageSource}
          style={{ width: 56, height: 56, borderRadius: 16 }}
          contentFit="cover"
        />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold dark:text-white" numberOfLines={1}>{team.name}</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">Leader: {leaderName}</Text>
        </View>
        <View className="flex-row items-center mt-0.5">
          <Text className="text-slate-400 dark:text-slate-500 text-[12px]">
            {memberCount} members
          </Text>
          <Text className="text-slate-300 dark:text-slate-600 mx-2">•</Text>
          <View className="flex-row items-center">
            <IconSymbol
              name={team.isPublic ? "lock.open.fill" : "lock.fill"}
              size={12}
              color={team.isPublic ? "#22C55E" : "#94A3B8"}
            />
            <Text className={`ml-1 text-[10px] font-bold ${team.isPublic ? 'text-green-600' : 'text-slate-500'}`}>
              {team.isPublic ? 'PUBLIC' : 'PRIVATE'}
            </Text>
          </View>
        </View>
      </View>

      {!isAuthorized && (
        <TouchableOpacity
          onPress={() => onPress?.(team)}
          activeOpacity={0.8}
          className="px-5 py-2.5 rounded-xl shadow-sm bg-theme-light-tint dark:bg-theme-dark-tint"
        >
          <Text className="text-xs font-black uppercase tracking-widest text-white dark:text-black">
            {team.isPublic ? 'JOIN' : 'REQUEST'}
          </Text>
        </TouchableOpacity>
      )}

      {isAuthorized && (
        <IconSymbol name="chevron.right" size={18} color={isDark ? '#4A5568' : '#CBD5E1'} />
      )}
    </Wrapper>
  );
}
