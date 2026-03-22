import { useEffect, useState } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

export function useColorScheme() {
  const { colorScheme } = useNativeWindColorScheme();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const active = colorScheme ?? 'light';
  const final = hasHydrated ? active : 'light';

  return {
    colorScheme: final,
    isDark: final === 'dark',
    isLight: final === 'light',
  };
}
