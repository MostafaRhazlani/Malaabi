import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PlayerService, type Stadium } from '@/services/player.service';
import StadiumCard from '@/components/stadium-card';

export default function ExploreScreen() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStadiums = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (loadingRef.current && !replace) return;
      loadingRef.current = true;
      if (replace) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const result = await PlayerService.getStadiums({
          search: debouncedSearch || undefined,
          page: pageNum,
          limit: 10,
        });
        setTotalPages(result.totalPages);
        setStadiums((prev) =>
          replace || pageNum === 1 ? result.data : [...prev, ...result.data],
        );
        setPage(pageNum);
      } catch (err) {
        console.error('Failed to fetch stadiums:', err);
        setError('Failed to load stadiums. Please try again.');
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch],
  );

  useEffect(() => {
    fetchStadiums(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleRefresh = () => {
    fetchStadiums(1, true);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loadingRef.current) {
      fetchStadiums(page + 1, false);
    }
  };

  const renderEmpty = () => {
    if (loading && stadiums.length === 0) return null;
    return (
      <View className="flex-1 items-center justify-center py-20 gap-3">
        <Ionicons name="football-outline" size={56} color="#9CA3AF" />
        <Text className="text-gray-500 dark:text-gray-400 text-base font-medium">
          No stadiums found
        </Text>
        {debouncedSearch ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text className="text-primary-600 dark:text-primary-400 text-sm font-semibold">
              Clear search
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || stadiums.length === 0) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#139765" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-zinc-950" edges={['bottom']}>
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 h-12">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-[15px] text-gray-900 dark:text-white"
            placeholder="Search stadiums, city..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results count */}
      {!loading && stadiums.length > 0 && (
        <Text className="px-4 pb-2 text-xs text-gray-400 dark:text-gray-500">
          {stadiums.length} stadium{stadiums.length !== 1 ? 's' : ''} found
        </Text>
      )}

      {/* Error State */}
      {error && (
        <View className="mx-4 mb-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <Text className="text-red-600 dark:text-red-400 text-sm text-center">{error}</Text>
          <TouchableOpacity onPress={handleRefresh} className="mt-2">
            <Text className="text-red-700 dark:text-red-300 text-sm font-semibold text-center">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Initial Loading */}
      {loading && stadiums.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#139765" />
        </View>
      )}

      {/* Stadium List */}
      {stadiums.length > 0 || !loading ? (
        <FlatList
          data={stadiums}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StadiumCard stadium={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </SafeAreaView>
  );
}
