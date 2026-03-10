import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setUser, clearUser } from '@/store/slices/authSlice';
import { AuthService } from '@/services/auth.service';

export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const hydrate = async () => {
      const session = await AuthService.getSession();
      if (session?.accessToken && session.role && session.email) {
        dispatch(setUser({ email: session.email, role: session.role }));
      } else {
        dispatch(clearUser());
      }
    };
    hydrate();
  }, [dispatch]);

  return null;
}
