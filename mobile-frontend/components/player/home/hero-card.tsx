import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import { intervalToDuration, isPast, format, Duration, addHours } from 'date-fns';
import { TimeUnit } from './_components/time-unit';

interface HeroCardProps {
  matchDate?: Date | null;
  stadiumName?: string;
  location?: string;
  team1?: { name: string; logo: any };
  team2?: { name: string; logo: any };
}

export function HeroCard({ 
  matchDate, 
  stadiumName = 'Terrain Hay Riad #3', 
  location = 'Rabat',
  team1 = { name: 'Atlas FC', logo: require('../../../assets/logos/team-1.png') },
  team2 = { name: 'Wolves', logo: require('../../../assets/logos/team-2.png') },
}: HeroCardProps) {
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null);
  const [isMatchNow, setIsMatchNow] = useState(false);
  const [isMatchEnded, setIsMatchEnded] = useState(false);

  useEffect(() => {
    if (!matchDate) return;

    const updateTimer = () => {
      // Hide card 1 hour after match starts
      if (isPast(addHours(matchDate, 1))) {
        setIsMatchEnded(true);
        return true;
      }

      if(isPast(matchDate)) {
        setIsMatchNow(true);
        setTimeLeft(null);
        return false;
      }

      const duration = intervalToDuration({
        start: new Date(),
        end: matchDate,
      });

      setTimeLeft(duration);
      setIsMatchNow(false);
      return false;
    };

    const ended = updateTimer();
    if(ended) return;

    const timer = setInterval(() => {
      const ended = updateTimer();
      if (ended) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [matchDate]);

  if (!matchDate || isMatchEnded) return null;

  const isUrgent = timeLeft && !timeLeft.days && !timeLeft.hours;
  const pad = (n: number = 0) => n.toString().padStart(2, '0');

  return (
    <View 
      className="rounded-xl mt-2 overflow-hidden border border-primary-500/20 bg-theme-light-card dark:bg-theme-dark-card shadow-sm"
    >
      {/* Top Part */}
      <View className="bg-theme-light-card dark:bg-theme-dark-card pt-4 px-4 pb-4">
        {/* Strip */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="bg-primary-500/10 border border-primary-500/20 rounded-full py-1 px-3 flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
            <Text className="text-primary-500 text-xs font-bold uppercase tracking-wider">Next Match</Text>
          </View>
          <Text className="text-[#546E7A] text-xs tracking-wide">
            { format(matchDate, 'eee, MMM d') }
          </Text>
        </View>

        {/* Teams Row */}
        <View className="flex-row items-center justify-between">
          <View className="items-center gap-2 flex-1">
            <View className="w-24 h-24 items-center justify-center p-2 overflow-hidden">
              <Image 
                source={team1.logo} 
                style={{ width: '100%', height: '100%', borderRadius: 14 }}
                contentFit="contain"
                transition={200}
              />
            </View>
            <Text className="text-theme-light-text dark:text-theme-dark-text text-base font-bold tracking-wider">{team1.name}</Text>
            <Text className="text-primary-500 text-xs uppercase tracking-wider">Your Team</Text>
          </View>

          <View className="items-center gap-1 px-2 shrink-0">
            <Text className="text-[#546E7A] text-3xl font-bold tracking-widest">VS</Text>
            <View className="bg-primary-500/10 border border-primary-500/20 rounded-full py-1 px-3">
              <Text className="text-primary-500 text-xs font-bold tracking-wider">{ format(matchDate, 'HH:mm') }</Text>
            </View>
          </View>

          <View className="items-center gap-2 flex-1">
            <View className="w-24 h-24 items-center justify-center p-2 overflow-hidden">
              <Image 
                source={team2.logo} 
                style={{ width: '100%', height: '100%', borderRadius: 14 }}
                contentFit="contain"
                transition={200}
              />
            </View>
            <Text className="text-theme-light-text dark:text-theme-dark-text text-base font-bold tracking-wider">{team2.name}</Text>
            <Text className="text-[#546E7A] text-xs uppercase tracking-wider">Away</Text>
          </View>
        </View>
      </View>

      {/* Pitch Bar */}
      <View className="bg-black/5 dark:bg-white/5 py-2 px-4 flex-row items-center justify-between border-y border-black/5 dark:border-white/5">
        <View className="flex-row items-center gap-2 flex-1 mr-4">
          <IconSymbol name="map" size={12} color="#546E7A" />
          <Text 
            className="text-[#546E7A] text-xs flex-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            <Text className="text-theme-light-text dark:text-theme-dark-text font-bold">
              {stadiumName}
            </Text> 
            {' · '}{location}
          </Text>
        </View>
        <Text className="text-[#546E7A] text-xs tracking-wide shrink-0">7 vs 7</Text>
      </View>

      {/* Bottom Part */}
      <View className="bg-black/5 dark:bg-white/5 pt-4 px-4 pb-4">
        <Text className="text-[#546E7A] text-xs font-bold text-center tracking-widest uppercase mb-3">Kickoff in</Text>

        {isMatchNow ? (
          <Text className="text-error text-2xl font-bold text-center tracking-widest uppercase mb-4">Match Started</Text>
        ) : (
          <View className="flex-row justify-center items-start gap-2 mb-4">
            <TimeUnit value={pad(timeLeft?.hours)} label="Hours" isUrgent={isUrgent} />
            <Text className="text-[#546E7A]/40 text-3xl font-bold mt-1">:</Text>
            <TimeUnit value={pad(timeLeft?.minutes)} label="Mins" isUrgent={isUrgent} />
            <Text className="text-[#546E7A]/40 text-3xl font-bold mt-1">:</Text>
            <TimeUnit value={pad(timeLeft?.seconds)} label="Secs" isUrgent={isUrgent} />
          </View>
        )}

        <View className="flex-row gap-2 mt-2">
          <TouchableOpacity className="flex-1 bg-primary-500 py-3 rounded-xl items-center justify-center flex-row shadow-sm">
            <Text className="text-white dark:text-black text-base font-bold tracking-wider uppercase">View Match Details</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl items-center justify-center">
            <Text className="text-base">
              <IconSymbol name="map" size={20} color="#546E7A" />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
