import { Linking, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapPin } from 'phosphor-react-native';
import { Stadium } from '@/interfaces/stadium.interface';
import { useThemeColor } from '@/hooks/use-theme-color';

export function StadiumLocationMap({
  stadium,
  tint,
  mapsUrl,
}: {
  stadium: Stadium;
  tint: string;
  mapsUrl: string;
}) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      {stadium.latitude != null && stadium.longitude != null ? (
        <>
          <MapView
            style={{ width: '100%', height: 208 }}
            initialRegion={{
              latitude: stadium.latitude,
              longitude: stadium.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker
              coordinate={{ latitude: stadium.latitude, longitude: stadium.longitude }}
              title={stadium.name}
              description={stadium.address}
              pinColor={tint}
            />
          </MapView>
          <View className="px-4 py-3">
            <View className="flex-row items-center gap-1.5">
              <MapPin size={13} color={iconColor} weight="fill" />
              <Text className="text-sm text-slate-500 dark:text-slate-400 flex-1" numberOfLines={1}>
                {stadium.address}, {stadium.city}
              </Text>
            </View>
            <TouchableOpacity
              className="mt-3 rounded-xl py-2.5 items-center"
              style={{ backgroundColor: tint }}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(mapsUrl)}
            >
              <Text className="text-white font-semibold text-sm">Open in Maps</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View className="px-4 py-5 items-center gap-2">
          <MapPin size={28} color={iconColor} weight="duotone" />
          <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Location not set for this stadium.
          </Text>
          <TouchableOpacity
            className="mt-1 rounded-xl py-2.5 px-6 items-center"
            style={{ backgroundColor: tint }}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(mapsUrl)}
          >
            <Text className="text-white font-semibold text-sm">Search on Maps</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

