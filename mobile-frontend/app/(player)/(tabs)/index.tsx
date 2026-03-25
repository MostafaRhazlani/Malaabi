import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { HeroCard } from '@/components/player/home/hero-card';
import { FilterBar } from '@/components/ui/filter-bar';
import { RecentStadiums } from '@/components/player/home/recent-stadiums';

const FILTERS = ['Tout', '5-5', '7-7', '8-8', '11-11', 'Indoor'];

export default function PlayerHomeScreen() {
  const [activeFilter, setActiveFilter] = useState('Tout');

  // Mocking an upcoming match
  const mockMatch = {
    kickoff: "2026-03-25T16:25:00+01:00",
    stadium: "Stade Massira",
    city: "Safi",
    opponent: {
      name: "Olympic Safi",
      logo: require('../../../assets/logos/team-2.png')
    }
  };

  const kickoffDate = new Date(mockMatch.kickoff);

  const filterMap: Record<string, string | undefined> = {
    'Tout': undefined,
    '5-5': 'FIVE_V_FIVE',
    '7-7': 'SEVEN_V_SEVEN',
    '8-8': 'EIGHT_V_EIGHT',
    '11-11': 'ELEVEN_V_ELEVEN',
    'Indoor': 'INDOOR',
  };

  const stadiumType = filterMap[activeFilter];

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

      {/* Recent Stadiums */}
      <RecentStadiums type={stadiumType} />

    </ScrollView>
  );
}
