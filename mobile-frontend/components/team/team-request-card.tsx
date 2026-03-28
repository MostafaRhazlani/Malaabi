import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { BASE_URL } from "@/services/api";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  TeamJoinRequest,
  RequestStatus,
  RequestType,
} from "@/interfaces/team.interface";

export interface TeamRequestCardProps {
  request: TeamJoinRequest;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onPress?: () => void;
}

export const TeamRequestCard = React.memo(
  ({
    request,
    onAccept,
    onReject,
    onCancel,
    onPress,
  }: TeamRequestCardProps) => {
    const isInvitation = request?.type === RequestType.INVITATION;
    const team = request?.team;
    const logoSource = team?.logo
      ? { uri: `${BASE_URL}${team.logo}` }
      : { uri: "https://cdn-icons-png.flaticon.com/512/1165/1165187.png" };

    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-theme-light-card dark:bg-theme-dark-card mx-4 mb-3 p-4 flex-row items-center"
      >
        <View className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl items-center justify-center">
          <Image
            source={logoSource}
            style={{ width: 50, height: 50, borderRadius: 12 }}
            contentFit="contain"
          />
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-lg font-bold dark:text-white" numberOfLines={1}>
            {team?.name}
          </Text>
          <Text className="text-xs text-slate-500 font-medium mt-1">
            {isInvitation ? "Invited you to join" : "Waiting for approval"}
          </Text>
          <View className="flex-row items-center mt-2">
            <View
              className={`px-2 py-0.5 rounded-full ${request?.status === RequestStatus.PENDING ? "bg-amber-100 dark:bg-amber-900/30" : "bg-slate-100 dark:bg-slate-800"}`}
            >
              <Text
                className={`text-[10px] font-black uppercase ${request?.status === RequestStatus.PENDING ? "text-amber-600" : "text-slate-500"}`}
              >
                {request?.status}
              </Text>
            </View>
            <Text className="text-[10px] text-slate-400 font-bold ml-2 uppercase">
              {isInvitation ? "INCOMING" : "OUTGOING"}
            </Text>
          </View>
        </View>
        {isInvitation && request?.status === RequestStatus.PENDING && (
          <View className="flex-row gap-x-2 ml-2">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onReject?.();
              }}
              className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full items-center justify-center border border-red-100 dark:border-red-900/40"
            >
              <IconSymbol name="xmark" size={18} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onAccept?.();
              }}
              className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-full items-center justify-center border border-green-100 dark:border-green-900/40"
            >
              <IconSymbol name="checkmark" size={18} color="#22C55E" />
            </TouchableOpacity>
          </View>
        )}

        {!isInvitation &&
          request?.status === RequestStatus.PENDING &&
          onCancel && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/40"
            >
              <Text className="text-xs font-black uppercase text-red-500">
                Cancel
              </Text>
            </TouchableOpacity>
          )}
      </TouchableOpacity>
    );
  },
);

TeamRequestCard.displayName = "TeamRequestCard";