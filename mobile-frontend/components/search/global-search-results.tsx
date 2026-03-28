import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { Stadium } from '@/interfaces/stadium.interface';
import { Player, Team } from '@/interfaces/team.interface';
import { TeamCard } from '@/components/team-card';
import { StadiumCard } from '@/components/staduim-card';
import { SearchFilter } from '@/hooks/use-global-search';
import { MemberCard } from '@/components/team/member-card';

interface GlobalSearchResultsProps {
  activeFilter: SearchFilter;
  loading: boolean;
  emptyMessage: string;
  stadiums: Stadium[];
  teams: Team[];
  players: Player[];
  canJoinTeam?: boolean;
  onTeamPress: (team: Team) => void;
  onRecruitPlayer?: (player: Player, isInvited: boolean) => void;
  invitedPlayerIds?: string[];
  recruitingPlayerId?: string | null;
}

export function GlobalSearchResults({
  activeFilter,
  loading,
  emptyMessage,
  stadiums,
  teams,
  players,
  canJoinTeam = true,
  onTeamPress,
  onRecruitPlayer,
  invitedPlayerIds,
  recruitingPlayerId,
}: GlobalSearchResultsProps) {
  const hasResults =
    (activeFilter === 'Stadiums' && stadiums.length > 0) ||
    (activeFilter === 'Teams' && teams.length > 0) ||
    (activeFilter === 'Players' && players.length > 0);

  if (loading) {
    return (
      <View className="py-14 items-center justify-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!hasResults) {
    return (
      <View className="py-16 px-10 items-center justify-center">
        <Text className="text-slate-400 dark:text-slate-500 text-center font-medium">
          {emptyMessage}
        </Text>
      </View>
    );
  }

  if (activeFilter === 'Stadiums') {
    return (
      <FlatList
        data={stadiums}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StadiumCard stadium={item} />}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 32, paddingTop: 7 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    );
  }

  if (activeFilter === 'Teams') {
    return (
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TeamCard team={item} onPress={onTeamPress} canJoinTeam={canJoinTeam} />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    );
  }

  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isInvited = Boolean(invitedPlayerIds?.includes(item.id));
        const isInAnotherTeam = Boolean(item.team);

        return (
          <View>
            <MemberCard
              member={item}
              actionLabel={!isInAnotherTeam && onRecruitPlayer ? (isInvited ? 'CANCEL RECRUIT' : 'RECRUIT') : undefined}
              actionVariant={isInvited ? 'danger' : 'primary'}
              onAction={onRecruitPlayer ? () => onRecruitPlayer(item, isInvited) : undefined}
              isActionLoading={recruitingPlayerId === item.id}
            />
            {isInAnotherTeam && (
               <View className="absolute right-4 top-1/2 -mt-4 bg-slate-100 dark:bg-slate-800 h-8 px-3 rounded-lg items-center justify-center">
                  <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">IN ANOTHER TEAM</Text>
               </View>
            )}
          </View>
        );
      }}
      contentContainerStyle={{ paddingBottom: 32 }}
    />
  );
}
