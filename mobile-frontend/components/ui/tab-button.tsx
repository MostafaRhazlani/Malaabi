import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Animatable from 'react-native-animatable';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { TabButtonProps } from '@/interfaces/tab-button-props.interface';
import { StrictAnimation } from '@/types/animation';
const animate1: StrictAnimation = { 0: { scale: .5, translateY: 0 }, 1: { scale: 1.2, translateY: -24 }};
const animate2: StrictAnimation = { 0: { scale: 1.2, translateY: -24 }, 1: { scale: 1, translateY: 0 } };

export const TabButton: React.FC<TabButtonProps> = (props) => {
  const { item, onPress, ...rest } = props;
  const focused = (props as any)['aria-selected'];
  const viewRef = useRef<Animatable.View & View>(null);
  const { colorScheme } = useColorScheme();

  const activeColor = Colors[colorScheme].tint;
  const inactiveColor = Colors[colorScheme].icon;

  useEffect(() => {
    if (focused) {
      viewRef.current?.animate(animate1);
    } else {
      viewRef.current?.animate(animate2);
    }
  }, [focused]);

  return (
    <TouchableOpacity 
        {...(rest as any)}
        onPress={onPress}
        activeOpacity={1}
        style={styles.container}
    >
      <Animatable.View
        ref={viewRef}
        duration={500}
        style={[
          styles.btn,
          { 
            backgroundColor: Colors[colorScheme].card
          }
        ]}
      >
        <IconSymbol 
          name={item.icon} 
          size={24} 
          color={focused ? activeColor : inactiveColor} 
          weight={focused ? "fill" : "regular"} 
        />
      </Animatable.View>   
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
});