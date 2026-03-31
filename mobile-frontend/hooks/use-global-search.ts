import { useEffect, useMemo, useState } from 'react';
import { Stadium } from '@/interfaces/stadium.interface';
import { Player, Team } from '@/interfaces/team.interface';
import { StadiumService } from '@/services/stadium.service';
import { teamService } from '@/services/team.service';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const SEARCH_FILTERS = ['Stadiums', 'Teams', 'Players'] as const;
export type SearchFilter = (typeof SEARCH_FILTERS)[number];

const toSearchFilter = (value?: string): SearchFilter => {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'teams') return 'Teams';
  if (normalized === 'players') return 'Players';
  return 'Stadiums';
};

const normalize = (value?: string) => (value || '').trim().toLowerCase();

export function useGlobalSearch(initialFilter?: string) {
  const [activeFilter, setActiveFilter] = useState<SearchFilter>(
    toSearchFilter(initialFilter),
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [canJoinTeam, setCanJoinTeam] = useState(true);
  const query = useSelector((state: RootState) => state.search.global);

  useEffect(() => {
    setActiveFilter(toSearchFilter(initialFilter));
  }, [initialFilter]);

  useEffect(() => {
    let isCancelled = false;

    const runSearch = async () => {
      setLoading(true);
      setErrorMessage(null);
      const normalizedQuery = normalize(query);

      try {
        if (activeFilter === 'Stadiums') {
          const data = normalizedQuery
            ? await StadiumService.search(normalizedQuery)
            : await StadiumService.getAll();

          if (!isCancelled) {
            setStadiums(data);
            setTeams([]);
            setPlayers([]);
          }
          return;
        }

        if (activeFilter === 'Teams') {
          const [allTeams, myTeams] = await Promise.all([
            teamService.getAllTeams(),
            teamService.getMyTeams().catch(() => [] as Team[]),
          ]);

          if (!isCancelled) {
            setCanJoinTeam(myTeams.length === 0);
          }

          const filtered = normalizedQuery
            ? allTeams.filter((team) => {
                const teamName = normalize(team.name);
                const leader = normalize(
                  `${team.leader?.first_name || ''} ${team.leader?.last_name || ''}`,
                );
                return (
                  teamName.includes(normalizedQuery) ||
                  leader.includes(normalizedQuery)
                );
              })
            : allTeams;

          if (!isCancelled) {
            setTeams(filtered);
            setStadiums([]);
            setPlayers([]);
          }
          return;
        }

        if (!normalizedQuery) {
          if (!isCancelled) {
            setPlayers([]);
            setStadiums([]);
            setTeams([]);
          }
          return;
        }

        const result = await teamService.searchPlayers(normalizedQuery);
        if (!isCancelled) {
          setPlayers(result);
          setStadiums([]);
          setTeams([]);
        }
      } catch (error) {
        console.error('Global search fetch error:', error);

        if (!isCancelled) {
          setStadiums([]);
          setTeams([]);
          setPlayers([]);

          if (activeFilter === 'Stadiums') {
            setErrorMessage('Failed to load stadiums. Please try again.');
          } else if (activeFilter === 'Teams') {
            setErrorMessage('Failed to load teams. Please try again.');
          } else {
            setErrorMessage('Failed to load players. Please try again.');
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(runSearch, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [activeFilter, query]);

  const emptyMessage = useMemo(() => {
    if (errorMessage) {
      return errorMessage;
    }

    const normalizedQuery = normalize(query);

    if (activeFilter === 'Players' && !normalizedQuery) {
      return 'Type a player name to start searching.';
    }

    if (activeFilter === 'Stadiums') {
      return 'No stadiums found for this search.';
    }

    if (activeFilter === 'Teams') {
      return 'No teams found for this search.';
    }

    return 'No players found for this search.';
  }, [activeFilter, query, errorMessage]);

  return {
    activeFilter,
    setActiveFilter,
    query,
    loading,
    stadiums,
    teams,
    players,
    canJoinTeam,
    errorMessage,
    emptyMessage,
  };
}
