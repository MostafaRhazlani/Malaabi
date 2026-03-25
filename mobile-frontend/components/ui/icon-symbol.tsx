// Icon component using phosphor-react-native icons

import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import {
  House,
  MagnifyingGlass,
  Heart,
  UsersThree,
  User,
  PaperPlaneTilt,
  Code,
  CaretRight,
  MapPin,
  Bell,
  SignOut,
  ChatCircle,
  SoccerBall,
  Trophy,
  CalendarPlus,
  XCircle,
} from 'phosphor-react-native';

type IconMapping = Record<SymbolViewProps['name'], React.ComponentType<any>>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Map SF Symbols to Phosphor icons.
 * - Phosphor icons: https://phosphoricons.com/
 */
const MAPPING = {
  'house.fill': House,
  'magnifyingglass': MagnifyingGlass,
  'heart.fill': Heart,
  'person.3.fill': UsersThree,
  'person.fill': User,
  'paperplane.fill': PaperPlaneTilt,
  'chevron.left.forwardslash.chevron.right': Code,
  'chevron.right': CaretRight,
  'map': MapPin,
  'bell.fill': Bell,
  'rectangle.portrait.and.arrow.right': SignOut,
  'bubble.right.fill': ChatCircle,
  'sportscourt.fill': SoccerBall,
  'trophy.fill': Trophy,
  'calendar.badge.plus': CalendarPlus,
  'xmark.circle.fill': XCircle,
} as IconMapping;

/**
 * An icon component that uses Phosphor icons across all platforms.
 * Provides a consistent look and feel with optimized icons.
 * Icon `name`s are based on SF Symbols and mapped to Phosphor icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight | 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}) {
  const Icon = MAPPING[name];
  return <Icon color={color} size={size} weight={weight} style={style} />;
}
