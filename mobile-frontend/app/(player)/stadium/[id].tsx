import { useMemo, useState } from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import {
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BASE_URL,
} from '@/services/api';
import { STADIUM_TYPE_LABEL, Stadium } from '@/interfaces/stadium.interface';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { StadiumHeaderInfo } from '@/components/stadium/stadium-header-info';
import { StadiumFeatures } from '@/components/stadium/stadium-features';
import { StadiumManager } from '@/components/stadium/stadium-manager';
import { StadiumDescription } from '@/components/stadium/stadium-description';
import { StadiumLocationMap } from '@/components/stadium/stadium-location-map';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { StadiumHeaderImage } from '@/components/stadium/stadium-header-image';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1518605368461-1ee123c72b26?q=80&w=1200&auto=format&fit=crop';

function parseParam(v: string | string[] | undefined) {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function getMapsUrl(s: Stadium) {
  if (s.latitude != null && s.longitude != null)
    return `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`;
  const q = encodeURIComponent(`${s.name}, ${s.address}, ${s.city}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export default function StadiumDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const [isFavorite, setIsFavorite] = useState(false);
  const params = useLocalSearchParams<{ id: string; stadium?: string }>();

  const tint = useThemeColor({}, 'tint');
  const tintBg = colorScheme === 'dark' ? '#082b1f' : '#effdf5';

  const stadium = useMemo<Stadium | null>(() => {
    const raw = parseParam(params.stadium);
    if (!raw) return null;
    try { return JSON.parse(decodeURIComponent(raw)) as Stadium; }
    catch { return null; }
  }, [params.stadium]);

  if (!stadium) {
    return (
      <View className="flex-1 items-center justify-center bg-theme-light-background dark:bg-theme-dark-background">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-slate-500 dark:text-slate-400 text-base">Unable to load stadium details.</Text>
      </View>
    );
  }

  const typeLabel = STADIUM_TYPE_LABEL[stadium.stadiumType] ?? stadium.stadiumType;
  const heroImages = useMemo(() => {
    if (!stadium.images || stadium.images.length === 0) return [PLACEHOLDER];
    return stadium.images.map(img =>
      img.startsWith('http') ? img : `${BASE_URL}${img}`
    );
  }, [stadium.images]);

  const overview = `${stadium.name} is a premium football pitch in ${stadium.city}, perfect for competitive and casual matches. Enjoy quality turf, smooth booking and a great atmosphere.`;
  const mapsUrl = getMapsUrl(stadium);

  const features = [
    { icon: <IconSymbol name="person.2.fill" size={20} color={tint} weight="fill" />, label: typeLabel },
    { icon: <IconSymbol name="lightning.fill" size={20} color={tint} weight="fill" />, label: 'Floodlights' },
    { icon: <IconSymbol name="shower.fill" size={20} color={tint} weight="fill" />, label: 'Showers' },
  ];

  return (
    <View className="flex-1 bg-theme-light-background dark:bg-theme-dark-background">
      <Stack.Screen options={{ headerShown: false }} />

      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D1FAE5', dark: '#064E3B' }} // Emerald based backgrounds
        headerImage={
          <StadiumHeaderImage
            heroImages={heroImages}
            isFavorite={isFavorite}
            onToggleFavorite={() => setIsFavorite(p => !p)}
            onBack={() => router.back()}
            tint={tint}
          />
        }
      >
        {/* Stadium details content */}
        <View className="gap-6" style={{ paddingBottom: 60 + insets.bottom }}>
          <StadiumHeaderInfo name={stadium.name} city={stadium.city} rating="4.9" />

          <StadiumFeatures features={features} />

          {/* Price pills */}
          <View className="flex-row gap-3">
            <View
              className="flex-1 flex-row items-center justify-between rounded-2xl px-4 py-3"
              style={{ backgroundColor: tintBg }}
            >
              <View className="flex-row items-center gap-1.5">
                <IconSymbol name="soccer.ball.fill" size={20} color={tint} weight="fill" />
                <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full Match</Text>
              </View>
              <Text className="text-base font-black" style={{ color: tint }}>{stadium.priceFullMatch} DH</Text>
            </View>
            <View className="flex-1 flex-row items-center justify-between rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-700/60">
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">Half Match</Text>
              <Text className="text-base font-black text-slate-900 dark:text-white">{stadium.priceHalfMatch} DH</Text>
            </View>
          </View>

          <View className="h-px bg-slate-100 dark:bg-slate-700" />

          <StadiumManager tint={tint} />

          <StadiumDescription overview={overview} />

          <StadiumLocationMap stadium={stadium} tint={tint} mapsUrl={mapsUrl} />
        </View>
      </ParallaxScrollView>

      {/* ── Sticky Bottom Bar ── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex-row items-center justify-between px-5 py-4"
        style={{ paddingBottom: 12 + insets.bottom }}
      >
        <View>
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Price</Text>
          <View className="flex-row items-baseline gap-0.5">
            <Text className="text-2xl font-extrabold" style={{ color: tint }}>{stadium.priceFullMatch} DH</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium"> / match</Text>
          </View>
        </View>

        <Pressable
          className="rounded-full px-8 py-3.5 active:opacity-80"
          style={{
            backgroundColor: tint,
            shadowColor: tint,
            shadowOpacity: 0.35,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 10,
          }}
        >
          <Text className="text-base font-bold text-white">Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}
