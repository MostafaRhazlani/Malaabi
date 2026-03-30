import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { FavoriteService } from '@/services/favorite.service';
import { Stadium } from '@/interfaces/stadium.interface';
import { StadiumCard } from '@/components/staduim-card';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PlayerFavoritesScreen() {
  const [favorites, setFavorites] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      const data = await FavoriteService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-theme-light-background dark:bg-theme-dark-background">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-theme-light-background dark:bg-theme-dark-background" edges={['bottom']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-black text-slate-900 dark:text-white">My Favorites</Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your collection of top stadiums</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StadiumCard stadium={item} />}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 32, paddingTop: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22C55E" />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-40 px-10">
             <View className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                <IconSymbol name="heart" size={24} color="#22C55E" />
             </View>
            <Text className="text-slate-400 dark:text-slate-500 text-center font-medium">
              You haven't added any favorite stadiums yet. Add them from the stadium details page!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
