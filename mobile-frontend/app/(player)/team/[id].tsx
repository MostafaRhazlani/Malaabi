import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { teamService } from '@/services/team.service';
import { RequestType, Team, Player, TeamJoinRequest } from '@/interfaces/team.interface';
import { BASE_URL } from '@/services/api';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useAppSelector } from '@/store/hooks';
import { MemberCard } from '@/components/team/member-card';
import { TeamHeaderImage } from '@/components/team/team-header-image';

type SquadTab = 'MEMBERS' | 'REQUESTS';

const toFlatPlayer = (value: any): Player => {
  const player = value?.player ?? value;

  return {
    id: player?.id || '',
    first_name: player?.first_name || '',
    last_name: player?.last_name || '',
    profile_img: player?.profile_img,
    position: player?.position,
    birth_date: player?.birth_date,
  };
};

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);

  const goToTeamsTab = () => {
    router.replace('/(player)/(tabs)/team');
  };
  
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [hasPendingJoinRequest, setHasPendingJoinRequest] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<TeamJoinRequest[]>([]);
  const [activeSquadTab, setActiveSquadTab] = useState<SquadTab>('MEMBERS');
  const [requestActionLoadingId, setRequestActionLoadingId] = useState<
    string | null
  >(null);
  const [memberActionLoadingId, setMemberActionLoadingId] = useState<
    string | null
  >(null);
  
  const hasCurrentUser = Boolean(user?.id);
  const isLeader = hasCurrentUser && user!.id === team?.leaderId;
  const isMember =
    hasCurrentUser &&
    (team?.members?.some((m) => m.id === user!.id) || isLeader);

  const members = useMemo(
    () =>
      (team?.members || [])
        .filter((member) => member.id !== team?.leaderId)
        .map(toFlatPlayer),
    [team?.members, team?.leaderId],
  );

  const requests = useMemo(() => pendingRequests, [pendingRequests]);

  const fetchData = async () => {
    try {
      const data = await teamService.getTeamDetails(id as string);
      setTeam(data);

      const isCurrentUserLeader = user?.id === data.leaderId;
      const isCurrentUserMember =
        data.members?.some((member) => member.id === user?.id) ||
        isCurrentUserLeader;

      if (!isCurrentUserMember && user?.id && !data.isPublic) {
        try {
          const sentRequests = await teamService.getMySentRequests();
          const pendingForTeam = sentRequests.some(
            (request) =>
              request.teamId === data.id && request.type === RequestType.REQUEST,
          );
          setHasPendingJoinRequest(pendingForTeam);
        } catch {
          setHasPendingJoinRequest(false);
        }
      } else {
        setHasPendingJoinRequest(false);
      }

      if (user?.id && user.id === data.leaderId) {
        const requestItems = await teamService.getTeamRequests(data.id);
        setPendingRequests(requestItems);
      } else {
        setPendingRequests([]);
        setActiveSquadTab('MEMBERS');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const handleJoin = async () => {
      if (!team || (!team.isPublic && hasPendingJoinRequest)) return;
      setJoinLoading(true);
      try {
          await teamService.joinTeam(team.id);
          Alert.alert(
              team.isPublic ? 'Joined!' : 'Request Sent',
              team.isPublic ? `Successfully joined ${team.name}!` : 'Your request is pending leader approval.'
          );
          if (!team.isPublic) {
            setHasPendingJoinRequest(true);
          }
          fetchData();
      } catch (err: any) {
          Alert.alert('Error', err.response?.data?.message || 'Failed to join team');
      } finally {
          setJoinLoading(false);
      }
  };

  const handleAccept = async (request: TeamJoinRequest) => {
    if (!team || requestActionLoadingId || !request.playerId) return;

    setRequestActionLoadingId(request.id);

    try {
      await teamService.acceptTeamRequest(team.id, request.playerId);
      await fetchData();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to accept request',
      );
    } finally {
      setRequestActionLoadingId(null);
    }
  };

  const handleReject = async (request: TeamJoinRequest) => {
    if (!team || requestActionLoadingId || !request.playerId) return;

    setRequestActionLoadingId(request.id);

    try {
      await teamService.rejectTeamRequest(team.id, request.playerId);
      await fetchData();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to reject request',
      );
    } finally {
      setRequestActionLoadingId(null);
    }
  };

  const handleCancelRecruit = async (request: TeamJoinRequest) => {
    if (!team || requestActionLoadingId || !request.playerId) return;

    setRequestActionLoadingId(request.id);

    try {
      await teamService.cancelRecruit(team.id, request.playerId);
      await fetchData();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to cancel recruit',
      );
    } finally {
      setRequestActionLoadingId(null);
    }
  };

  const leaveTeam = async () => {
    if (!team || leaveLoading) return;

    setLeaveLoading(true);

    try {
      await teamService.leaveTeam(team.id);
      Alert.alert('Success', `You left ${team.name}`, [
        {
          text: 'OK',
          onPress: goToTeamsTab,
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to leave team',
      );
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleLeave = () => {
    if (!team || leaveLoading) return;

    Alert.alert(
      'Leave team?',
      `You are about to leave ${team.name}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            void leaveTeam();
          },
        },
      ],
    );
  };

  const deleteTeam = async () => {
    if (!team || deleteLoading) return;

    setDeleteLoading(true);

    try {
      await teamService.deleteTeam(team.id);
      Alert.alert('Success', `${team.name} was deleted`, [
        {
          text: 'OK',
          onPress: goToTeamsTab,
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to delete team',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteTeam = () => {
    if (!team || deleteLoading) return;

    Alert.alert(
      'Delete team?',
      `This will permanently delete ${team.name}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Team',
          style: 'destructive',
          onPress: () => {
            void deleteTeam();
          },
        },
      ],
    );
  };

  const expelMember = async (playerId: string) => {
    if (!team || memberActionLoadingId) return;

    setMemberActionLoadingId(playerId);

    try {
      await teamService.expelMember(team.id, playerId);
      await fetchData();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to expel member',
      );
    } finally {
      setMemberActionLoadingId(null);
    }
  };

  const handleExpel = (member: Player) => {
    if (!team || memberActionLoadingId) return;

    Alert.alert(
      'Expel member?',
      `Remove ${member.first_name} ${member.last_name} from ${team.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Expel',
          style: 'destructive',
          onPress: () => {
            void expelMember(member.id);
          },
        },
      ],
    );
  };



  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-theme-light-background dark:bg-theme-dark-background">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!team) return null;

  const isRequestButtonDisabled =
    joinLoading || (!team.isPublic && hasPendingJoinRequest);

  const logoSource = team.logo
    ? { uri: `${BASE_URL}${team.logo}` }
    : { uri: 'https://cdn-icons-png.flaticon.com/512/1165/1165187.png' };

  return (
    <View className="flex-1 bg-theme-light-background dark:bg-theme-dark-background">
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#F1F5F9', dark: '#0F172A' }}
        headerImage={
          <TeamHeaderImage
            logoSource={logoSource}
            onBack={goToTeamsTab}
          />
        }
      >
        {/* TEAM INFO */}
        <View className="flex-col mb-8 p-4">
          <View className="flex-row items-center">
            {/* Main Logo */}
            <View className="w-24 h-24 items-center justify-center">
              <Image source={logoSource} style={{ width: 90, height: 90, borderRadius: 10 }} contentFit="contain" />
            </View>
            <View className="p-4 flex-1">
              <Text className="text-3xl font-black dark:text-white" numberOfLines={2}>{team.name}</Text>

              <View className="flex-row items-center mt-3 gap-x-2">
                <View className={`px-3 py-1 rounded-full ${team.isPublic ? 'bg-green-100 dark:bg-green-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <Text className={`text-[10px] font-black ${team.isPublic ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                    {team.isPublic ? 'PUBLIC TEAM' : 'PRIVATE TEAM'}
                  </Text>
                </View>
                <View className="bg-theme-light-tint/10 dark:bg-theme-dark-tint/10 px-3 py-1 rounded-full">
                  <Text className="text-[10px] font-black text-theme-light-tint dark:text-theme-dark-tint">{team._count?.members || team.members?.length} MEMBERS</Text>
                </View>
              </View>
            </View>
          </View>
          
          {team.description && (
            <Text className="text-slate-500 dark:text-slate-400 mt-4 font-medium leading-relaxed">
              {team.description}
            </Text>
          )}

          {/* Join or Request button for non-members */}
          {!isMember && (
              <TouchableOpacity
                onPress={handleJoin}
                disabled={isRequestButtonDisabled}
                className={`mt-6 h-14 rounded-2xl items-center justify-center shadow-lg ${
                  !team.isPublic && hasPendingJoinRequest
                    ? 'bg-slate-200 dark:bg-slate-700'
                    : 'bg-theme-light-tint dark:bg-theme-dark-tint shadow-theme-light-tint/30'
                }`}
              >
                  {joinLoading ? (
                      <ActivityIndicator color="#fff" />
                  ) : (
                      <Text className="font-black text-lg text-white">
                        {!team.isPublic && hasPendingJoinRequest
                          ? 'REQUEST SENT'
                          : team.isPublic
                            ? 'JOIN SQUAD'
                            : 'SEND JOIN REQUEST'}
                      </Text>
                  )}
              </TouchableOpacity>
          )}

          {isMember && !isLeader && (
            <TouchableOpacity
              onPress={handleLeave}
              disabled={leaveLoading}
              className="mt-4 h-14 rounded-2xl items-center justify-center bg-red-50 dark:bg-red-900/20"
            >
              {leaveLoading ? (
                <ActivityIndicator color="#EF4444" />
              ) : (
                <Text className="font-black text-base text-red-500 dark:text-red-400">
                  LEAVE TEAM
                </Text>
              )}
            </TouchableOpacity>
          )}

          {isLeader && (
            <TouchableOpacity
              onPress={handleDeleteTeam}
              disabled={deleteLoading}
              className="mt-4 h-14 rounded-2xl items-center justify-center bg-red-600"
            >
              {deleteLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-black text-base text-white">
                  DELETE TEAM
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* TEAM ROSTER */}
        <View className="pb-32">
          {/* LEADER SECTION */}
          <View className="mb-10">
            <View className="flex-row items-center mb-4 px-4">
              <IconSymbol name="star.fill" size={16} color="#F59E0B" />
              <Text className="text-xs font-black text-amber-600 dark:text-amber-500 ml-2 tracking-widest uppercase">The Leader</Text>
            </View>
            {team.leader && <MemberCard member={toFlatPlayer(team.leader)} />}
          </View>

          {/* SQUAD SECTION WITH TABS */}
          <View>
            <View className="flex-row items-center mb-4 px-4">
              <IconSymbol name="person.3.fill" size={16} color="#94A3B8" />
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 ml-2 tracking-widest uppercase">The Squad</Text>
            </View>

            {isLeader && (
              <View className="mx-4 mb-5 flex-row rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/80">
                <TouchableOpacity
                  onPress={() => setActiveSquadTab('MEMBERS')}
                  className={`flex-1 flex-row items-center justify-center rounded-xl px-3 py-2 ${
                    activeSquadTab === 'MEMBERS'
                      ? 'bg-white dark:bg-slate-700'
                      : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-xs font-black uppercase ${
                      activeSquadTab === 'MEMBERS'
                        ? 'text-slate-800 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Members ({members.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveSquadTab('REQUESTS')}
                  className={`flex-1 flex-row items-center justify-center rounded-xl px-3 py-2 ${
                    activeSquadTab === 'REQUESTS'
                      ? 'bg-white dark:bg-slate-700'
                      : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-xs font-black uppercase ${
                      activeSquadTab === 'REQUESTS'
                        ? 'text-slate-800 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Requests
                  </Text>
                  {requests.length > 0 && (
                    <View className="ml-2 min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5">
                      <Text className="text-[10px] font-black text-white">
                        {requests.length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {requestActionLoadingId && activeSquadTab === 'REQUESTS' && (
              <View className="mb-3 flex-row items-center px-4">
                <ActivityIndicator size="small" color="#22C55E" />
                <Text className="ml-2 text-xs font-bold uppercase text-slate-400">
                  Updating request...
                </Text>
              </View>
            )}

            {memberActionLoadingId && activeSquadTab === 'MEMBERS' && (
              <View className="mb-3 flex-row items-center px-4">
                <ActivityIndicator size="small" color="#EF4444" />
                <Text className="ml-2 text-xs font-bold uppercase text-slate-400">
                  Removing member...
                </Text>
              </View>
            )}

            {activeSquadTab === 'REQUESTS' && isLeader
              ? requests.map((request) => {
                  const player = toFlatPlayer(request.player);

                  if (request.type === RequestType.INVITATION) {
                    return (
                      <MemberCard
                        key={`request-${request.id}`}
                        member={player}
                        actionLabel="CANCEL RECRUIT"
                        actionVariant="danger"
                        onAction={() => handleCancelRecruit(request)}
                        isActionLoading={requestActionLoadingId === request.id}
                      />
                    );
                  }

                  return (
                    <MemberCard
                      key={`request-${request.id}`}
                      member={player}
                      isRequest
                      onAccept={() => handleAccept(request)}
                      onReject={() => handleReject(request)}
                    />
                  );
                })
              : members.map((member) => (
                  <MemberCard
                    key={`${activeSquadTab.toLowerCase()}-${member.id}`}
                    member={toFlatPlayer(member)}
                    isExpellable={activeSquadTab === 'MEMBERS' && isLeader}
                    onExpel={() => handleExpel(member)}
                  />
                ))}

            {(activeSquadTab === 'REQUESTS' && isLeader
              ? requests.length === 0
              : members.length === 0) && (
              <View className="bg-slate-50 dark:bg-slate-800/10 p-10 mx-4 rounded-3xl items-center border border-dashed border-slate-200 dark:border-slate-800">
                <IconSymbol
                  name={
                    activeSquadTab === 'REQUESTS' && isLeader
                      ? 'bell.slash.fill'
                      : 'person.3'
                  }
                  size={32}
                  color="#CBD5E1"
                />
                <Text className="text-slate-400 font-bold mt-4 text-center">
                  {activeSquadTab === 'REQUESTS' && isLeader
                    ? 'No pending requests or recruits'
                    : 'No other members joined yet'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ParallaxScrollView>

      {/* Floating Recruitment Button for Leader */}
      {isLeader && (
          <TouchableOpacity
            onPress={() => router.push({
                pathname: '/(player)/(tabs)/search',
                params: {
                  filter: 'Players',
                  showBack: '1',
                  teamId: team.id,
                }
            })}
            style={{
                position: 'absolute',
                bottom: 30,
                right: 20,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#22C55E',
                paddingHorizontal: 20,
                height: 56,
                borderRadius: 28,
                shadowColor: '#22C55E',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
            }}
          >
              <IconSymbol name="person.badge.plus" size={20} color="#fff" />
              <Text className="text-white font-black ml-3 tracking-wider">RECRUIT PLAYERS</Text>
          </TouchableOpacity>
      )}
    </View>
  );
}
