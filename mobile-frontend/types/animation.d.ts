import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

export interface AnimatableShorthands {
  opacity?: number;
  scale?: number;
  translateY?: number;
  translateX?: number;
}

export type CustomStyle = ViewStyle & TextStyle & ImageStyle & AnimatableShorthands;

export type StrictAnimation = {
  [key: number]: CustomStyle;
  from?: CustomStyle;
  to?: CustomStyle;
};
