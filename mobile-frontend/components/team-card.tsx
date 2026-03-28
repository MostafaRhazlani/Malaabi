import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  RequestStatus,
  RequestType,
  Team,
  TeamJoinRequest,
} from '@/interfaces/team.interface';
import { Image } from 'expo-image';
import { BASE_URL } from '@/services/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface TeamCardProps {
  team?: Team;
  request?: TeamJoinRequest;
  variant?: 'TEAM' | 'REQUEST';
  canJoinTeam?: boolean;
  onPress?: (team: Team) => void;
  onRequestPress?: (request: TeamJoinRequest) => void;
  onCancelRequest?: (request: TeamJoinRequest) => void;
  onAcceptInvitation?: (request: TeamJoinRequest) => void;
  onRejectInvitation?: (request: TeamJoinRequest) => void;
  isCancellingRequest?: boolean;
  invitationActionRequestId?: string | null;
}

export function TeamCard({
  team,
  request,
  variant = 'TEAM',
  canJoinTeam = true,
  onPress,
  onRequestPress,
  onCancelRequest,
  onAcceptInvitation,
  onRejectInvitation,
  isCancellingRequest,
  invitationActionRequestId,
}: TeamCardProps) {
  const { isDark } = useColorScheme();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isRequestCard = variant === 'REQUEST' && Boolean(request);

  const cardTeam = isRequestCard ? request?.team : team;
  if (!cardTeam) return null;

  const isInvitation = request?.type === RequestType.INVITATION;
  const isPendingOutgoingRequest =
    !isInvitation && request?.status === RequestStatus.PENDING;
  const isPendingIncomingInvitation =
    isInvitation && request?.status === RequestStatus.PENDING;

  const hasCurrentUser = Boolean(currentUser?.id);
  const isLeader = hasCurrentUser && currentUser!.id === cardTeam.leader?.id;
  const isMember =
    hasCurrentUser &&
    (cardTeam.members?.some((m) => m.id === currentUser!.id) || isLeader);
  const isAuthorized = isLeader || isMember;
  const hasPendingRequest =
    !cardTeam.isPublic && Boolean(cardTeam.hasPendingJoinRequest);
  const joinActionDisabled = hasPendingRequest || !canJoinTeam;

  const imageSource = cardTeam.logo
    ? { uri: `${BASE_URL}${cardTeam.logo}` }
    : cardTeam.image || {
        uri: 'https://cdn-icons-png.flaticon.com/512/1165/1165187.png',
      };

  const memberCount = cardTeam._count?.members || cardTeam.members?.length || 0;
  const leaderName = cardTeam.leader
    ? `${cardTeam.leader.first_name} ${cardTeam.leader.last_name}`
    : 'Unknown';

  const isCardPressable = isRequestCard || isAuthorized;
  const Wrapper = (isCardPressable ? TouchableOpacity : View) as any;

  return (
    <Wrapper
      activeOpacity={isCardPressable ? 0.7 : 1}
      onPress={() => {
        if (isRequestCard && request) {
          onRequestPress?.(request);
          return;
        }

        if (team && isAuthorized) {
          onPress?.(team);
        }
      }}
      className="bg-theme-light-card dark:bg-theme-dark-card p-4 flex-row items-center border-b border-slate-100 dark:border-slate-700"
    >
      <View className="w-14 h-14 items-center justify-center mr-4">
        <Image
          source={imageSource}
          style={{ width: 56, height: 56, borderRadius: 16 }}
          contentFit="cover"
        />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold dark:text-white" numberOfLines={1}>
          {cardTeam.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isRequestCard
              ? isInvitation
                ? 'Invited you to join'
                : 'Waiting for approval'
              : `Leader: ${leaderName}`}
          </Text>
        </View>

        <View className="flex-row items-center mt-0.5">
          {isRequestCard ? (
            <>
              <View
                className={`px-2 py-0.5 rounded-full ${
                  request?.status === RequestStatus.PENDING
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <Text
                  className={`text-[10px] font-black uppercase ${
                    request?.status === RequestStatus.PENDING
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  {request?.status}
                </Text>
              </View>
              <Text className="text-[10px] text-slate-400 font-bold ml-2 uppercase">
                {isInvitation ? 'INCOMING' : 'OUTGOING'}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-slate-400 dark:text-slate-500 text-[12px]">
                {memberCount} members
              </Text>
              <Text className="text-slate-300 dark:text-slate-600 mx-2">•</Text>
              <View className="flex-row items-center">
                <IconSymbol
                  name={cardTeam.isPublic ? 'lock.open.fill' : 'lock.fill'}
                  size={12}
                  color={cardTeam.isPublic ? '#22C55E' : '#94A3B8'}
                />
                <Text
                  className={`ml-1 text-[10px] font-bold ${
                    cardTeam.isPublic ? 'text-green-600' : 'text-slate-500'
                  }`}
                >
                  {cardTeam.isPublic ? 'PUBLIC' : 'PRIVATE'}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {isRequestCard && isPendingOutgoingRequest && request && onCancelRequest && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            if (!isCancellingRequest) {
              onCancelRequest(request);
            }
          }}
          disabled={Boolean(isCancellingRequest)}
          className={`px-3 py-2 rounded-xl border ${
            isCancellingRequest
              ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/40'
          }`}
        >
          <Text
            className={`text-xs font-black uppercase ${
              isCancellingRequest
                ? 'text-slate-500 dark:text-slate-400'
                : 'text-red-500'
            }`}
          >
            {isCancellingRequest ? 'Cancelling...' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      )}

      {isRequestCard &&
        isPendingIncomingInvitation &&
        request &&
        onAcceptInvitation &&
        onRejectInvitation && (
          invitationActionRequestId === request.id ? (
            <View className="px-2">
              <ActivityIndicator size="small" color="#22C55E" />
            </View>
          ) : (
            <View className="flex-row gap-x-2 ml-2">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onRejectInvitation(request);
                }}
                className="h-9 rounded-xl bg-red-50 px-3 items-center justify-center border border-red-100 dark:bg-red-900/20 dark:border-red-900/40"
              >
                <Text className="text-[10px] font-black tracking-wider text-red-500 dark:text-red-400 uppercase">
                  CANCEL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onAcceptInvitation(request);
                }}
                className="h-9 rounded-xl bg-theme-light-tint px-3 items-center justify-center dark:bg-theme-dark-tint"
              >
                <Text className="text-[10px] font-black tracking-wider text-white dark:text-black uppercase">
                  JOIN
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}

      {!isRequestCard && !isAuthorized && (
        <TouchableOpacity
          onPress={() => {
            if (!joinActionDisabled) {
              onPress?.(cardTeam);
            }
          }}
          disabled={joinActionDisabled}
          activeOpacity={0.8}
          className={`px-5 py-2.5 rounded-xl shadow-sm ${
            joinActionDisabled
              ? 'bg-slate-200 dark:bg-slate-700'
              : 'bg-theme-light-tint dark:bg-theme-dark-tint'
          }`}
        >
          <Text
            className={`text-xs font-black uppercase tracking-widest ${
              joinActionDisabled
                ? 'text-slate-600 dark:text-slate-300'
                : 'text-white dark:text-black'
            }`}
          >
            {!canJoinTeam && !hasPendingRequest
              ? 'IN ANOTHER TEAM'
              : cardTeam.isPublic
                ? 'JOIN'
                : hasPendingRequest
                  ? 'REQUEST SENT'
                  : 'REQUEST'}
          </Text>
        </TouchableOpacity>
      )}

      {!isRequestCard && isAuthorized && (
        <IconSymbol name="chevron.right" size={18} color={isDark ? '#4A5568' : '#CBD5E1'} />
      )}
    </Wrapper>
  );
}
