import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FilterBar } from '@/components/ui/filter-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TeamCard } from '@/components/team-card';
import { Team } from '@/interfaces/team.interface';
import { CreateTeamModal } from '@/components/team/create-team-modal';
import { teamService } from '@/services/team.service';

const TEAMS_FILTERS = ['Teams', 'My Teams'];

export default function PlayerTeamScreen() {
  const [activeFilter, setActiveFilter] = useState('Teams');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = activeFilter === 'Teams' 
        ? await teamService.getAllTeams() 
        : await teamService.getMyTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [activeFilter]);

  const router = useRouter();

  const handleTeamPress = (team: Team) => {
    router.push({
      pathname: '/(player)/team/[id]',
      params: { id: team.id }
    });
  };

  return (
    <View className="flex-1 bg-theme-light-background dark:bg-theme-dark-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
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
          filters={TEAMS_FILTERS}
          activeFilter={activeFilter}
          onFilterPress={setActiveFilter}
        />

        <View className="my-6 px-4">
          <Text className="text-2xl font-black dark:text-white">
            {activeFilter === 'Teams' ? 'Discover Teams' : 'My Squads'}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 mt-1">
            {activeFilter === 'Teams' 
              ? 'Join a squad and dominate the pitch' 
              : 'Manage your teams and prepare for glory'}
          </Text>
        </View>

        {teams.length > 0 ? (
          teams.map(item => (
            <TeamCard key={item.id} team={item} onPress={handleTeamPress} />
          ))
        ) : (
          !loading && (
            <View className="items-center justify-center py-20">
               <View className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                 <IconSymbol name="person.3.fill" size={32} color="#94A3B8" />
               </View>
               <Text className="text-lg font-bold dark:text-white">
                 {activeFilter === 'My Teams' ? 'No Teams Yet' : 'No Public Teams'}
               </Text>
               <Text className="text-slate-500 text-center px-10 mt-2">
                 {activeFilter === 'My Teams' 
                   ? "You haven't joined or created any teams yet." 
                   : "There are currently no public teams available to join."}
               </Text>
            </View>
          )
        )}
        
        {loading && teams.length === 0 && (
           <ActivityIndicator size="large" className="mt-20" color="#22C55E" />
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setIsModalVisible(true)}
        className="absolute right-6 w-16 h-16 rounded-full items-center justify-center z-50 bg-theme-light-tint dark:bg-theme-dark-tint"
        style={{
          bottom: insets.bottom + 30,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <IconSymbol name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Create Team Modal */}
      <CreateTeamModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onTeamCreated={fetchTeams}
      />
    </View>
  );
}


