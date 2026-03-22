import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { Colors } from './theme';

// Custom light theme
export const CustomLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: 'transparent',
    notification: Colors.light.tint,
  },
};

// Custom dark theme
export const CustomDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: 'transparent',
    notification: Colors.dark.tint,
  },
};