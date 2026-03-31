import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

export function useColorScheme() {
  const { colorScheme } = useNativeWindColorScheme();
  const current = colorScheme ?? 'light';
  return {
    colorScheme: current,
    isDark: current === 'dark',
    isLight: current === 'light',
  }
}
