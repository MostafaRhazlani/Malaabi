import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/constants/routes';

export default function GuardLayout() {
  const router = useRouter();
  const { user, isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isLoading) return;
    if (user?.role !== 'GUARD') {
      router.replace(ROUTES.AUTH_LOGIN);
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== 'GUARD') return null;

  return <Slot />;
}
