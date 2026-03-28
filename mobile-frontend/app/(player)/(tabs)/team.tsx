import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FilterBar } from '@/components/ui/filter-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Team, TeamJoinRequest } from '@/interfaces/team.interface';
import { CreateTeamModal } from '@/components/team/create-team-modal';
import { TeamTabContent } from '@/components/team/team-tab-content';
import { TEAMS_FILTERS, useTeamTabData } from '@/hooks/use-team-tab-data';

export default function PlayerTeamScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {
    activeFilter,
    setActiveFilter,
    teams,
    requests,
    loading,
    canCreateTeam,
    canJoinTeam,
    myTeamId,
    cancellingRequestId,
    invitationActionRequestId,
    fetchTeams,
    handleCancelRequest,
    handleAcceptInvitation,
    handleRejectInvitation,
  } = useTeamTabData();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const visibleFilters = useMemo(
    () => (myTeamId ? TEAMS_FILTERS : TEAMS_FILTERS.filter((f) => f !== 'My Team')),
    [myTeamId],
  );

  useEffect(() => {
    if (!myTeamId && activeFilter === 'My Team') {
      setActiveFilter('Teams');
    }
  }, [activeFilter, myTeamId, setActiveFilter]);

  const handleFilterPress = (filter: string) => {
    if (filter !== 'My Team') {
      setActiveFilter(filter);
      return;
    }

    if (myTeamId) {
      router.push({
        pathname: '/(player)/team/[id]',
        params: { id: myTeamId },
      });
      return;
    }

    setActiveFilter('Teams');
  };

  const handleTeamPress = (team: Team) => {
    router.push({
      pathname: '/(player)/team/[id]',
      params: { id: team.id }
    });
  };

  const handleRequestPress = (request: TeamJoinRequest) => {
    if (!request.team?.id) return;
    handleTeamPress(request.team);
  };

  return (
    <View className="flex-1 bg-theme-light-background dark:bg-theme-dark-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchTeams} 
            colors={['#22C55E']}
            tintColor={'#22C55E'}
          />
        }
      >
        <FilterBar
          filters={visibleFilters}
          activeFilter={activeFilter}
          onFilterPress={handleFilterPress}
        />

        <View className="my-6 px-5">
          <Text className="text-3xl font-black dark:text-white uppercase tracking-tighter">
            {activeFilter === 'Requests' ? 'REQUESTS' : 'DISCOVER'}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {activeFilter === 'Requests'
              ? 'Track and cancel your pending join requests'
              : 'Join a squad and dominate the pitch'}
          </Text>
        </View>

        <TeamTabContent
          activeFilter={activeFilter}
          teams={teams}
          requests={requests}
          loading={loading}
          canJoinTeam={canJoinTeam}
          cancellingRequestId={cancellingRequestId}
          invitationActionRequestId={invitationActionRequestId}
          onTeamPress={handleTeamPress}
          onRequestPress={handleRequestPress}
          onCancelRequest={handleCancelRequest}
          onAcceptInvitation={handleAcceptInvitation}
          onRejectInvitation={handleRejectInvitation}
        />
        
        {loading && teams.length === 0 && requests.length === 0 && (
           <ActivityIndicator size="large" className="mt-20" color="#22C55E" />
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) for Creating Teams */}
        {canCreateTeam && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setIsModalVisible(true)}
          className="absolute right-6 w-16 h-16 rounded-full items-center justify-center z-50 bg-theme-light-tint dark:bg-theme-dark-tint"
          style={{
            bottom: insets.bottom + 30,
            shadowColor: '#22C55E',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <IconSymbol name="plus" size={30} color="#fff" />
        </TouchableOpacity>
        )}

      {/* Create Team Modal */}
      <CreateTeamModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onTeamCreated={fetchTeams}
      />
    </View>
  );
}
