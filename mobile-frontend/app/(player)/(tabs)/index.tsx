import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { HeroCard } from '@/components/player/home/hero-card';
import { FilterBar } from '@/components/ui/filter-bar';

const FILTERS = ['Tout', '5-5', '7-7', '8-8', '11-11', 'Indoor'];

export default function PlayerHomeScreen() {
  const [activeFilter, setActiveFilter] = useState('Tout');

  // Mocking an upcoming match
  const mockMatch = {
    kickoff: "2026-03-25T15:25:00+01:00",
    stadium: "Stade Massira",
    city: "Safi",
    opponent: {
      name: "Olympic Safi",
      logo: require('../../../assets/logos/team-2.png')
    }
  };

  const kickoffDate = new Date(mockMatch.kickoff);

  return (
    <ScrollView
      className="flex-1 mx-2"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
      stickyHeaderIndices={[0]}
    >
      {/* Filters Segment (Sticky) */}
      <FilterBar
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterPress={setActiveFilter}
      />
      {/* Hero Card Segment */}
      <HeroCard
        matchDate={kickoffDate}
        stadiumName={mockMatch.stadium}
        location={mockMatch.city}
        team2={mockMatch.opponent}
      />

    </ScrollView>
  );
}
