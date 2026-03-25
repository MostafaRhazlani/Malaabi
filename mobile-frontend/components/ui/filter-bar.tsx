import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

export interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  onFilterPress: (filter: string) => void;
}

export function FilterBar({ filters, activeFilter, onFilterPress }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 20 }}
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            onPress={() => onFilterPress(filter)}
            className="py-3 items-center relative"
          >
            <Text className={`${isActive ? 'font-black text-black dark:text-white' : 'font-medium text-gray-500 dark:text-gray-400'}`}>
              {filter}
            </Text>
            {/* Underline indicator matches Temu exactly */}
            {isActive && (
              <View className="absolute bottom-2 w-6 h-1 rounded-full bg-black dark:bg-white" />
            )}
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  );
}
