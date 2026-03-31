import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { TabItem } from '@/interfaces/tab-item.interface';

export interface TabButtonProps extends BottomTabBarButtonProps {
  item: TabItem;
}
