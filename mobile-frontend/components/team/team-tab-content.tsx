import React from 'react';
import { View, Text } from 'react-native';
import { TeamCard } from '@/components/team-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Team, TeamJoinRequest } from '@/interfaces/team.interface';

interface TeamTabContentProps {
  activeFilter: string;
  teams: Team[];
  requests: TeamJoinRequest[];
  loading: boolean;
  canJoinTeam: boolean;
  cancellingRequestId: string | null;
  invitationActionRequestId: string | null;
  onTeamPress: (team: Team) => void;
  onRequestPress: (request: TeamJoinRequest) => void;
  onCancelRequest: (request: TeamJoinRequest) => void;
  onAcceptInvitation: (request: TeamJoinRequest) => void;
  onRejectInvitation: (request: TeamJoinRequest) => void;
}

export function TeamTabContent({
  activeFilter,
  teams,
  requests,
  loading,
  canJoinTeam,
  cancellingRequestId,
  invitationActionRequestId,
  onTeamPress,
  onRequestPress,
  onCancelRequest,
  onAcceptInvitation,
  onRejectInvitation,
}: TeamTabContentProps) {
  const hasItems = activeFilter === 'Requests' ? requests.length > 0 : teams.length > 0;

  if (hasItems) {
    if (activeFilter === 'Requests') {
      return (
        <>
          {requests.map((request) => (
            <TeamCard
              key={request.id}
              variant="REQUEST"
              request={request}
              onRequestPress={onRequestPress}
              onCancelRequest={
                cancellingRequestId && cancellingRequestId !== request.id
                  ? undefined
                  : onCancelRequest
              }
              onAcceptInvitation={
                invitationActionRequestId && invitationActionRequestId !== request.id
                  ? undefined
                  : onAcceptInvitation
              }
              onRejectInvitation={
                invitationActionRequestId && invitationActionRequestId !== request.id
                  ? undefined
                  : onRejectInvitation
              }
              isCancellingRequest={cancellingRequestId === request.id}
              invitationActionRequestId={invitationActionRequestId}
            />
          ))}
        </>
      );
    }

    return (
      <>
        {teams.map((item) => (
          <TeamCard
            key={item.id}
            team={item}
            onPress={onTeamPress}
            canJoinTeam={canJoinTeam}
          />
        ))}
      </>
    );
  }

  if (loading) return null;

  return (
    <View className="items-center justify-center py-20 px-10">
      <View className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full items-center justify-center mb-4">
        <IconSymbol name="person.3.fill" size={32} color="#94A3B8" />
      </View>
      <Text className="text-lg font-bold dark:text-white text-center">
        {activeFilter === 'My Team'
          ? 'No Squads Found'
          : activeFilter === 'Requests'
            ? 'No Pending Requests'
            : 'No Public Teams'}
      </Text>
      <Text className="text-slate-400 text-center mt-2">
        {activeFilter === 'My Team'
          ? "You haven't joined or created any squads yet. Start your journey today!"
          : activeFilter === 'Requests'
            ? "You haven't sent any join requests yet. Find a squad and send one!"
            : 'There are currently no public teams available. Why not create your own?'}
      </Text>
    </View>
  );
}
