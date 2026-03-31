import { BASE_URL } from '@/services/api';
import { AuthUser } from '@/store/slices/authSlice';
import { differenceInYears } from 'date-fns';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

interface PlayerProfileCardProps {
  user: AuthUser | null;
}

const POSITION_LABELS: Record<string, string> = {
  GK: 'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  FWD: 'Forward',
};

const getAge = (birthDate?: string | null) => {
  if (!birthDate) return 'N/A';
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return `${differenceInYears(new Date(), parsed)}`;
};

const getAvatarUri = (profileImg?: string | null) => {
  if (!profileImg) return null;
  if (profileImg.startsWith('http')) return profileImg;
  return `${BASE_URL}${profileImg}`;
};

export function PlayerProfileCard({ user }: PlayerProfileCardProps) {
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Player';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join('') || 'PL';

  const avatarUri = getAvatarUri(user?.profileImg);
  const position = user?.position ? POSITION_LABELS[user.position] ?? user.position : 'N/A';
  const age = getAge(user?.birthDate ?? null);

  return (
    <View className="bg-theme-light-card dark:bg-theme-dark-card rounded-3xl p-5 border border-slate-100 dark:border-slate-800">
      <View className="flex-row items-center">
        <View className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 items-center justify-center overflow-hidden">
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={{ width: 80, height: 80 }} contentFit="cover" />
          ) : (
            <Text className="text-lg font-black text-slate-500 dark:text-slate-300">{initials}</Text>
          )}
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-xl font-black text-slate-900 dark:text-white" numberOfLines={1}>
            {fullName}
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1" numberOfLines={1}>
            {user?.email ?? 'No email'}
          </Text>
        </View>
      </View>

      <View className="flex-row mt-5 gap-3">
        <View className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3">
          <Text className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Age</Text>
          <Text className="text-base font-bold text-slate-900 dark:text-white mt-1">{age}</Text>
        </View>

        <View className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3">
          <Text className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Position</Text>
          <Text className="text-base font-bold text-slate-900 dark:text-white mt-1" numberOfLines={1}>
            {position}
          </Text>
        </View>
      </View>
    </View>
  );
}
