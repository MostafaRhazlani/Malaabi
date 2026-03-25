import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useStadiums } from '@/hooks/use-stadiums';
import { StadiumCard } from '@/components/staduim-card';



interface RecentStadiumsProps {
  type?: string;
}

export function RecentStadiums({ type }: RecentStadiumsProps) {
  const { stadiums, loading, error } = useStadiums(type);

  return (
    <View className="mt-2">

      <FlatList
        data={stadiums}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: 0 }}
        renderItem={({ item }) => <StadiumCard stadium={item} />}
        ListEmptyComponent={
          loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#22C55E" />
              <Text className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading stadiums...</Text>
            </View>
          ) : error ? (
            <View className="py-10 items-center">
              <Text className="text-slate-400 dark:text-slate-500 text-base">{error}</Text>
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-slate-400 dark:text-slate-500 text-base">No stadiums available yet</Text>
            </View>
          )
        }
      />
    </View>
  );
}
