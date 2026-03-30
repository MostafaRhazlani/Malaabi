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
  CaretLeft,
  MapPin,
  Bell,
  SignOut,
  ChatCircle,
  SoccerBall,
  Trophy,
  CalendarPlus,
  XCircle,
  Star,
  ArrowLeft,
  Lightning,
  Shower,
  Phone,
  Users,
  Plus,
  PlusCircle,
  X,
  Camera,
  Minus,
  Lock,
  LockOpen,
  BellSlash,
  Tray,
  UserPlus,
  Check,
  UserFocus,
  ArrowRight,
  Ticket,
  EnvelopeSimple,
  Calendar,
  GenderIntersex,
  PencilSimple,
  Briefcase,
  Wallet,
  Question,
  Gear,
  ShoppingBag,
  SquaresFour,
} from 'phosphor-react-native';

/**
 * Map SF Symbols to Phosphor icons.
 * - Phosphor icons: https://phosphoricons.com/
 */
const MAPPING = {
  'house.fill': House,
  'magnifyingglass': MagnifyingGlass,
  'heart.fill': Heart,
  'heart': Heart,
  'person.3.fill': UsersThree,
  'person.3': UsersThree,
  'person.2.fill': Users,
  'person.fill': User,
  'paperplane.fill': PaperPlaneTilt,
  'chevron.left.forwardslash.chevron.right': Code,
  'chevron.right': CaretRight,
  'chevron.left': CaretLeft,
  'map': MapPin,
  'bell.fill': Bell,
  'bell.slash.fill': BellSlash,
  'rectangle.portrait.and.arrow.right': SignOut,
  'bubble.right.fill': ChatCircle,
  'sportscourt.fill': SoccerBall,
  'trophy.fill': Trophy,
  'calendar.badge.plus': CalendarPlus,
  'xmark.circle.fill': XCircle,
  'star': Star,
  'star.fill': Star,
  'lightning.fill': Lightning,
  'shower.fill': Shower,
  'phone.fill': Phone,
  'soccer.ball.fill': SoccerBall,
  'plus': Plus,
  'plus.circle.fill': PlusCircle,
  'xmark': X,
  'camera.fill': Camera,
  'minus': Minus,
  'lock.fill': Lock,
  'lock.open.fill': LockOpen,
  'tray': Tray,
  'person.badge.plus': UserPlus,
  'checkmark': Check,
  'checkmark.circle.fill': Check,
  'arrow.right': ArrowRight,
  'person.fill.questionmark': UserFocus,
  'ticket': Ticket,
  'envelope.fill': EnvelopeSimple,
  'calendar': Calendar,
  'person.fill.viewfinder': GenderIntersex,
  'pencil': PencilSimple,
  'briefcase': Briefcase,
  'creditcard.fill': Wallet,
  'questionmark.circle.fill': Question,
  'gearshape.fill': Gear,
  'bag.fill': ShoppingBag,
  'rectangle.grid.2x2.fill': SquaresFour,
} as Record<string, React.ComponentType<any>>;

export type IconSymbolName = keyof typeof MAPPING;

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
  
  if (!Icon) {
      console.warn(`IconSymbol: Icon "${name}" not found in MAPPING`);
      return null;
  }

  return <Icon color={color} size={size} weight={weight === 'fill' ? 'fill' : weight} style={style} />;
}
