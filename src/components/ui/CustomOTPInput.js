import { moderateScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const { width: screenWidth } = Dimensions.get('window');

const CustomOTPInput = ({ length = 6, onChange, onComplete }) => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const [values, setValues] = useState(Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const refs = useRef([]);

  // Calculate box size dynamically to fit the width comfortably
  const boxSize = useMemo(() => {
    const totalSpacing = moderateScale(10) * (length - 1);
    const availableWidth = screenWidth - moderateScale(80); // Padding on both sides
    return (availableWidth - totalSpacing) / length;
  }, [length]);

  useEffect(() => {
    refs.current[activeIndex]?.focus();
  }, [activeIndex]);

  const setAndNotify = nextValues => {
    setValues(nextValues);
    const nextCode = nextValues.join('');
    onChange?.(nextCode);
    if (nextValues.every(v => v !== '')) onComplete?.(nextCode);
  };

  const handleChange = (text, index) => {
    const digits = (text || '').replace(/\D/g, '');

    if (digits.length > 1) {
      const next = [...values];
      let i = index;
      for (const ch of digits) {
        if (i >= length) break;
        next[i] = ch;
        i += 1;
      }
      setAndNotify(next);
      setActiveIndex(clamp(index + digits.length, 0, length - 1));
      return;
    }

    const ch = digits;
    const next = [...values];
    next[index] = ch;
    setAndNotify(next);

    if (ch && index < length - 1) setActiveIndex(index + 1);
  };

  const handleKeyPress = (e, index) => {
    const key = e?.nativeEvent?.key;

    if (key === 'Backspace') {
      if (values[index] !== '') {
        const next = [...values];
        next[index] = '';
        setAndNotify(next);
        return;
      }
      if (index > 0) {
        const prev = index - 1;
        const next = [...values];
        next[prev] = '';
        setAndNotify(next);
        setActiveIndex(prev);
      }
    }
  };

  const guardFocus = index => {
    if (index !== activeIndex) {
      refs.current[activeIndex]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {values.map((val, i) => {
        const isActive = i === activeIndex;
        const hasValue = val !== '';
        return (
          <TextInput
            key={i}
            ref={r => (refs.current[i] = r)}
            value={val}
            autoFocus={i === 0}
            onChangeText={t => handleChange(t, i)}
            onKeyPress={e => handleKeyPress(e, i)}
            onFocus={() => guardFocus(i)}
            keyboardType={Platform.select({
              ios: 'number-pad',
              android: 'number-pad',
            })}
            inputMode="numeric"
            maxLength={1}
            returnKeyType="done"
            style={[
              styles.box,
              {
                width: boxSize,
                height: verticalScale(60),
                borderColor: isActive
                  ? theme.colors.primary
                  : hasValue
                  ? theme.colors.primary + '80'
                  : theme.colors.border,
                borderWidth: isActive ? 2 : 1,
                backgroundColor: isActive
                  ? theme.colors.backgroundColor
                  : theme.colors.bgSecondary || theme.colors.backgroundColor,
              },
            ]}
            selectionColor={theme.colors.primary}
            cursorColor={theme.colors.primary}
          />
        );
      })}
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      gap: moderateScale(10),
      width: '100%',
    },
    box: {
      borderRadius: moderateScale(12),
      fontSize: moderateScale(24),
      fontFamily: 'Lato-Bold',
      textAlign: 'center',
      color: theme.colors.text,
      includeFontPadding: false,
    },
  });

export default CustomOTPInput;
