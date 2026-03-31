import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { RequestType, Team, TeamJoinRequest } from '@/interfaces/team.interface';
import { teamService } from '@/services/team.service';
import { useAppSelector } from '@/store/hooks';

export const TEAMS_FILTERS = ['Teams', 'My Team', 'Requests'];

export function useTeamTabData() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeFilter, setActiveFilter] = useState('Teams');
  const [teams, setTeams] = useState<Team[]>([]);
  const [requests, setRequests] = useState<TeamJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [canCreateTeam, setCanCreateTeam] = useState(true);
  const [canJoinTeam, setCanJoinTeam] = useState(true);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);
  const [invitationActionRequestId, setInvitationActionRequestId] =
    useState<string | null>(null);

  const syncCanCreateTeam = useCallback(
    (myTeams: Team[]) => {
      if (!user?.id) {
        setCanCreateTeam(true);
        setCanJoinTeam(true);
        setMyTeamId(null);
        return;
      }

      const hasAnyTeam = myTeams.length > 0;

      const preferredTeam =
        myTeams.find(
          (team) => team.leaderId === user.id || team.leader?.id === user.id,
        ) || myTeams[0];

      setCanCreateTeam(!hasAnyTeam);
      setCanJoinTeam(!hasAnyTeam);
      setMyTeamId(preferredTeam?.id ?? null);
    },
    [user?.id],
  );

  const fetchTeams = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      if (activeFilter === 'Teams') {
        const data = await teamService.getAllTeams();
        const myTeams = await teamService.getMyTeams();
        syncCanCreateTeam(myTeams);

        let sentRequests: TeamJoinRequest[] = [];
        try {
          sentRequests = await teamService.getMySentRequests();
        } catch (error) {
          // Keep Teams list working even if pending requests endpoint fails.
          console.error('Error fetching pending join requests:', error);
        }

        const pendingTeamIds = new Set(
          sentRequests
            .filter((request) => request.type === RequestType.REQUEST)
            .map((request) => request.teamId),
        );

        const teamsWithRequestState = data.map((team) => ({
          ...team,
          hasPendingJoinRequest:
            !team.isPublic && pendingTeamIds.has(team.id),
        }));

        setTeams(teamsWithRequestState);
        setRequests([]);
      } else if (activeFilter === 'My Team') {
        const data = await teamService.getMyTeams();
        syncCanCreateTeam(data);
        setTeams(data);
        setRequests([]);
      } else {
        const sentRequests = await teamService.getMySentRequests();
        const myTeams = await teamService.getMyTeams();
        syncCanCreateTeam(myTeams);
        setRequests(sentRequests);
        setTeams([]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      if (activeFilter === 'Requests') {
        setRequests([]);
        setTeams([]);
      } else {
        setTeams([]);
        setRequests([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [activeFilter, syncCanCreateTeam]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useFocusEffect(
    React.useCallback(() => {
      fetchTeams(true);
    }, [fetchTeams]),
  );

  const handleCancelRequest = useCallback(
    (request: TeamJoinRequest) => {
      if (!request.id || cancellingRequestId) return;

      Alert.alert(
        'Cancel Request',
        `Cancel your request to join ${request.team?.name || 'this team'}?`,
        [
          { text: 'Keep', style: 'cancel' },
          {
            text: 'Cancel Request',
            style: 'destructive',
            onPress: async () => {
              try {
                setCancellingRequestId(request.id);
                await teamService.cancelMySentRequest(request.id);
                await fetchTeams(true);
              } catch (error: any) {
                Alert.alert(
                  'Error',
                  error?.response?.data?.message || 'Failed to cancel request',
                );
              } finally {
                setCancellingRequestId(null);
              }
            },
          },
        ],
      );
    },
    [cancellingRequestId, fetchTeams],
  );

  const handleAcceptInvitation = useCallback(
    async (request: TeamJoinRequest) => {
      if (
        !request.id ||
        request.type !== RequestType.INVITATION ||
        invitationActionRequestId
      ) {
        return;
      }

      try {
        setInvitationActionRequestId(request.id);
        await teamService.acceptMyInvitation(request.id);
        await fetchTeams(true);
      } catch (error: any) {
        Alert.alert(
          'Error',
          error?.response?.data?.message || 'Failed to accept invitation',
        );
      } finally {
        setInvitationActionRequestId(null);
      }
    },
    [fetchTeams, invitationActionRequestId],
  );

  const handleRejectInvitation = useCallback(
    (request: TeamJoinRequest) => {
      if (
        !request.id ||
        request.type !== RequestType.INVITATION ||
        invitationActionRequestId
      ) {
        return;
      }

      Alert.alert(
        'Reject Invitation',
        `Reject invitation to join ${request.team?.name || 'this team'}?`,
        [
          { text: 'Keep', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: async () => {
              try {
                setInvitationActionRequestId(request.id);
                await teamService.rejectMyInvitation(request.id);
                await fetchTeams(true);
              } catch (error: any) {
                Alert.alert(
                  'Error',
                  error?.response?.data?.message ||
                    'Failed to reject invitation',
                );
              } finally {
                setInvitationActionRequestId(null);
              }
            },
          },
        ],
      );
    },
    [fetchTeams, invitationActionRequestId],
  );

  return {
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
  };
}
