import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setUser, clearUser } from '@/store/slices/authSlice';
import { AuthService } from '@/services/auth.service';

export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const hydrate = async () => {
      const session = await AuthService.getSession();
      if (session?.accessToken && session.role && session.email && session.userId) {
        dispatch(
          setUser({
            id: session.userId,
            email: session.email,
            role: session.role,
            firstName: session.firstName,
            lastName: session.lastName,
            birthDate: session.birthDate,
            position: session.position,
            profileImg: session.profileImg,
          }),
        );
      } else {
        dispatch(clearUser());
      }
    };
    hydrate();
  }, [dispatch]);

  return null;
}
