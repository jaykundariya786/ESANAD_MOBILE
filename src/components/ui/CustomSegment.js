import { verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomSegment = ({
  options,
  selectedIndex,
  onChange,
  activeColor,
  inactiveColor,
  disabledColor,
  underlineColor,
  backgroundColor,
  textStyle,
  style,
}) => {
  const { theme } = useThemeContext();

  // Use theme as default colors
  const ACTIVE = activeColor || theme.colors.primary;
  const INACTIVE = inactiveColor || theme.colors.text;
  const DISABLED = disabledColor || theme.colors.border;
  const UNDERLINE = underlineColor || theme.colors.backgroundColor;
  const BACKGROUND = backgroundColor || theme.colors.border;

  const styles = styless(theme);
  const translateX = useRef(new Animated.Value(0)).current;
  const [segWidth, setSegWidth] = useState(0);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    if (segWidth > 0 && isLayoutReady) {
      Animated.spring(translateX, {
        toValue: selectedIndex * segWidth,
        useNativeDriver: true,
        tension: 68,
        friction: 12,
      }).start();
    }
  }, [selectedIndex, segWidth, translateX, isLayoutReady]);

  const onLayout = e => {
    const total = e.nativeEvent.layout.width;
    if (!total || options.length === 0) return;
    const paddingOffset = verticalScale(4);
    const availableWidth = total - paddingOffset * 2;
    const nextSeg = availableWidth / options.length;
    setSegWidth(nextSeg);

    if (!isLayoutReady) {
      translateX.setValue(selectedIndex * nextSeg);
      setIsLayoutReady(true);
    }
  };

  return (
    <View
      onLayout={onLayout}
      style={[styles.container, { backgroundColor: BACKGROUND }, style]}
    >
      {segWidth > 0 && (
        <Animated.View
          style={[
            styles.underline,
            {
              width: segWidth,
              backgroundColor: UNDERLINE,
              transform: [{ translateX }],
            },
          ]}
        />
      )}

      {options.map((opt, index) => {
        const optionObj = typeof opt === 'string' ? { label: opt } : opt;
        const isActive = index === selectedIndex;
        const isDisabled = optionObj.disabled;

        return (
          <Pressable
            key={`${optionObj.label}-${index}`}
            style={[styles.option, optionObj?.flex]}
            disabled={isDisabled}
            onPress={() => !isDisabled && onChange(index)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive, disabled: isDisabled }}
            accessibilityLabel={`Segment ${index + 1}: ${optionObj.label}`}
          >
            <View style={styles.optionContent}>
              {optionObj.icon && (
                <Icon
                  name={optionObj.icon}
                  size={18}
                  color={isDisabled ? DISABLED : isActive ? ACTIVE : INACTIVE}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={[
                  styles.text,
                  {
                    color: isDisabled ? DISABLED : isActive ? ACTIVE : INACTIVE,
                  },
                  textStyle,
                ]}
              >
                {optionObj.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styless = theme =>
  StyleSheet.create({
    container: {
      position: 'relative',
      flexDirection: 'row',
      borderRadius: verticalScale(10),
      alignSelf: 'stretch',
      height: verticalScale(45),
      padding: verticalScale(4),
    },
    underline: {
      position: 'absolute',
      top: verticalScale(4),
      bottom: verticalScale(4),
      left: verticalScale(4),
      borderRadius: verticalScale(8),
    },
    option: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Bold',
    },
  });

export default CustomSegment;
