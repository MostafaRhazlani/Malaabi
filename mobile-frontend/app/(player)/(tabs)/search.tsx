import React from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FilterBar } from '@/components/ui/filter-bar';
import { Player, Team } from '@/interfaces/team.interface';
import {
  SEARCH_FILTERS,
  SearchFilter,
  useGlobalSearch,
} from '@/hooks/use-global-search';
import { GlobalSearchResults } from '@/components/search/global-search-results';
import { teamService } from '@/services/team.service';

export default function PlayerSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    filter?: string;
    showBack?: string;
    teamId?: string;
  }>();
  const [recruitingPlayerId, setRecruitingPlayerId] = React.useState<string | null>(
    null,
  );
  const [invitedPlayerIds, setInvitedPlayerIds] = React.useState<string[]>([]);

  const {
    activeFilter,
    setActiveFilter,
    loading,
    stadiums,
    teams,
    players,
    canJoinTeam,
    emptyMessage,
  } = useGlobalSearch(params.filter);

  const handleTeamPress = (team: Team) => {
    router.push({
      pathname: '/(player)/team/[id]',
      params: { id: team.id },
    });
  };

  React.useEffect(() => {
    let cancelled = false;

    const loadInvitations = async () => {
      if (!params.teamId) {
        setInvitedPlayerIds([]);
        return;
      }

      try {
        const ids = await teamService.getTeamInvitations(params.teamId);
        if (!cancelled) {
          setInvitedPlayerIds(ids);
        }
      } catch (error) {
        if (!cancelled) {
          setInvitedPlayerIds([]);
        }
      }
    };

    void loadInvitations();

    return () => {
      cancelled = true;
    };
  }, [params.teamId]);

  const handleRecruitPlayer = async (player: Player, isInvited: boolean) => {
    if (!params.teamId || !player.id || recruitingPlayerId) return;

    try {
      setRecruitingPlayerId(player.id);

      if (isInvited) {
        await teamService.cancelRecruit(params.teamId, player.id);
        setInvitedPlayerIds((prev) => prev.filter((id) => id !== player.id));
        Alert.alert(
          'Recruit Cancelled',
          `Invitation cancelled for ${player.first_name} ${player.last_name}.`,
        );
      } else {
        await teamService.invitePlayer(params.teamId, player.id);
        setInvitedPlayerIds((prev) =>
          prev.includes(player.id) ? prev : [...prev, player.id],
        );
        Alert.alert(
          'Recruit Sent',
          `Invitation sent to ${player.first_name} ${player.last_name}.`,
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          (isInvited
            ? 'Failed to cancel recruit invitation'
            : 'Failed to send recruit invitation'),
      );
    } finally {
      setRecruitingPlayerId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-theme-light-background dark:bg-theme-dark-background" edges={['bottom']}>
      <FilterBar
        filters={[...SEARCH_FILTERS]}
        activeFilter={activeFilter}
        onFilterPress={(filter) => setActiveFilter(filter as SearchFilter)}
      />

      <View className="flex-1">
        <GlobalSearchResults
          activeFilter={activeFilter}
          loading={loading}
          emptyMessage={emptyMessage}
          stadiums={stadiums}
          teams={teams}
          players={players}
          canJoinTeam={canJoinTeam}
          onTeamPress={handleTeamPress}
          onRecruitPlayer={params.teamId ? handleRecruitPlayer : undefined}
          invitedPlayerIds={params.teamId ? invitedPlayerIds : undefined}
          recruitingPlayerId={recruitingPlayerId}
        />
      </View>
    </SafeAreaView>
  );
}

