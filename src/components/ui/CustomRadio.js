import { scale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const CustomRadio = ({ options, onSelect, value }) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const [selected, setSelected] = useState(0);

  const handlePress = index => {
    setSelected(index);
    if (onSelect) {
      onSelect(options[index]);
    }
  };

  useEffect(() => {
    if (value) {
      const index = options.findIndex(item => item.value === value);
      if (index >= 0) setSelected(index);
    }
  }, [value]);

  return (
    <View style={styles.container}>
      {options.map((item, index) => {
        const isSelected = selected === index;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.radioWrapper,
              isSelected ? styles.radioActive : styles.radioInactive,
              { flex: 1 / options.length },
            ]}
            onPress={() => handlePress(index)}
            activeOpacity={0.7}
          >
            <View style={styles.radioContent}>
              <View
                style={[
                  styles.radioCircle,
                  isSelected && styles.radioCircleActive,
                ]}
              >
                {isSelected && <View style={styles.radioInnerDot} />}
              </View>
              <Text
                style={isSelected ? styles.labelActive : styles.labelInactive}
              >
                {item.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomRadio;

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: scale(12),
    },
    radioWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: scale(16),
      height: verticalScale(50),
      borderWidth: 1,
    },
    radioActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    radioInactive: {
      backgroundColor: theme.colors.backgroundColor,
      borderColor: theme.colors.border,
    },
    radioContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
    },
    radioCircle: {
      width: scale(20),
      height: scale(20),
      borderRadius: scale(10),
      borderWidth: 2,
      borderColor: theme.colors.description + '50',
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioCircleActive: {
      borderColor: theme.colors.primary,
    },
    radioInnerDot: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(5),
      backgroundColor: theme.colors.primary,
    },
    labelActive: {
      fontSize: scale(15),
      color: theme.colors.primary,
      fontFamily: 'Lato-Bold',
    },
    labelInactive: {
      fontSize: scale(15),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
    },
  });
