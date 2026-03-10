import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/constants/routes';

export default function PlayerLayout() {
  const router = useRouter();
  const { user, isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isLoading) return;
    if (user?.role !== 'PLAYER') {
      router.replace(ROUTES.AUTH_LOGIN);
    }
  }, [user, isLoading, router]);

  // Return null here to avoid a second spinner or a flash of unauthorized content.
  if (isLoading || user?.role !== 'PLAYER') return null;

  return <Slot />;
}
