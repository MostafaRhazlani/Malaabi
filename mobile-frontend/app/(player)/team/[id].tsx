import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { teamService } from '@/services/team.service';
import { Team } from '@/interfaces/team.interface';
import { BASE_URL } from '@/services/api';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { differenceInYears } from 'date-fns';

const { width } = Dimensions.get('window');

const calculateAge = (birthDate?: string | Date) => {
  if (!birthDate) return 'N/A';
  const birth = new Date(birthDate);
  const now = new Date();
  
  return differenceInYears(now, birth);;
};

const MemberCard = ({ member }: { member: any }) => {
  const avatar = member.profile_img
    ? { uri: `${BASE_URL}${member.profile_img}` }
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
          {member.first_name} {member.last_name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase font-black">
            {member.position || 'PLAYER'}
          </Text>
          <Text className="text-slate-300 dark:text-slate-600 mx-2">•</Text>
          <Text className="text-slate-400 dark:text-slate-500 text-[12px]">
            {calculateAge(member.birth_date)} years old
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useColorScheme();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const { width: windowWidth } = useWindowDimensions();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await teamService.getTeamDetails(id as string);
        setTeam(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-theme-light-background dark:bg-theme-dark-background">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!team) return null;

  const logoSource = team.logo
    ? { uri: `${BASE_URL}${team.logo}` }
    : { uri: 'https://cdn-icons-png.flaticon.com/512/1165/1165187.png' };

  return (
    <View className="flex-1 bg-theme-light-background dark:bg-theme-dark-background">
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#F1F5F9', dark: '#0F172A' }}
        headerImage={
          <View className="w-full h-full">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute top-14 left-6 w-10 h-10 bg-black/20 dark:bg-white/10 rounded-full items-center justify-center z-50 backdrop-blur-md"
            >
              <IconSymbol name="chevron.left" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Blurred background logo */}
            <Image
              source={logoSource}
              style={{ width: windowWidth, height: '100%', opacity: 0.15}}
              contentFit="cover"
              blurRadius={1}
            />
          </View>
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
                <View className={`px-3 py-1 rounded-full ${team.isPublic ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <Text className={`text-[10px] font-black ${team.isPublic ? 'text-green-600' : 'text-slate-500'}`}>
                    {team.isPublic ? 'PUBLIC TEAM' : 'PRIVATE TEAM'}
                  </Text>
                </View>
                <View className="bg-theme-light-tint/10 px-3 py-1 rounded-full">
                  <Text className="text-[10px] font-black text-theme-light-tint">{team._count?.members || team.members?.length} MEMBERS</Text>
                </View>
              </View>
            </View>
          </View>
          {team.description && (
            <Text className="text-slate-500 dark:text-slate-400 mt-4 font-medium leading-relaxed">
              {team.description}
            </Text>
          )}
        </View>

        {/* TEAM ROSTER */}
        <View>
          {/* LEADER SECTION */}
          <View className="mb-10">
            <View className="flex-row items-center mb-4 px-4">
              <IconSymbol name="star.fill" size={16} color="#F59E0B" />
              <Text className="text-xs font-black text-amber-600 dark:text-amber-500 ml-2 tracking-widest uppercase">The Leader</Text>
            </View>
            {team.leader && <MemberCard member={team.leader} />}
          </View>

          {/* MEMBERS SECTION */}
          <View>
            <View className="flex-row items-center mb-4 px-4">
              <IconSymbol name="person.3.fill" size={16} color="#94A3B8" />
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 ml-2 tracking-widest uppercase">The Squad ({team.members?.filter(m => m.id !== team.leader?.id).length})</Text>
            </View>
            {team.members?.filter(m => m.id !== team.leader?.id).map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}

            {((!team.members) || (team.members.length === 1 && team.members[0].id === team.leader?.id)) && (
              <View className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg items-center border border-dashed border-slate-200 dark:border-slate-700">
                <Text className="text-slate-400 font-bold">No other members have joined yet</Text>
              </View>
            )}
          </View>
        </View>
      </ParallaxScrollView>
    </View>
  );
}
