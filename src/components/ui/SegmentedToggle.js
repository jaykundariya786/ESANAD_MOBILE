import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeContext } from '@theme/ThemeProvider';
import { scale, verticalScale } from '@constants/metrics';

const SegmentedToggle = ({ label, options, value, onSelect }) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        {options.map((opt, i) => {
          const isActive = value === opt.value;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.8}
              style={[styles.segment, isActive && styles.segmentActive]}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default SegmentedToggle;

const getStyles = theme =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(18),
      borderRadius: scale(18),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: verticalScale(5),
    },
    label: {
      fontSize: scale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      flex: 1,
    },
    track: {
      flexDirection: 'row',
      backgroundColor: theme.colors.border + '20',
      borderRadius: scale(12),
      gap: verticalScale(5),
    },
    segment: {
      paddingHorizontal: scale(18),
      paddingVertical: verticalScale(8),
      borderRadius: scale(10),
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.bgSecondary,
    },
    segmentActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    segmentText: {
      fontSize: scale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    segmentTextActive: {
      color: theme.colors.textSecondary,
      fontFamily: 'Lato-Bold',
    },
  });
