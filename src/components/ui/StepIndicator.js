import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeContext } from '@theme/ThemeProvider';
import { scale, verticalScale, fontScale } from '@constants/metrics';

const StepIndicator = memo(
  ({
    steps,
    currentStep,
    onStepPress,
    allowFutureSelection = false,
    showLabels = true,
  }) => {
    const { theme } = useThemeContext();
    const activeColor = theme.colors.primary;
    const inactiveColor = theme.colors.border + '40';

    return (
      <View style={styles.container}>
        <View style={styles.track}>
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const canPress =
              !!onStepPress && (allowFutureSelection || index <= currentStep);

            return (
              <Pressable
                key={step.key || index}
                disabled={!canPress}
                onPress={() => onStepPress?.(index)}
                style={styles.stepWrapper}
              >
                {/* Labels at the top */}
                {showLabels && (
                  <Text
                    style={[
                      styles.label,
                      { color: isActive ? activeColor : theme.colors.description },
                      isActive && styles.activeLabel,
                    ]}
                  >
                    {step.label}
                  </Text>
                )}

                {/* Progress Segment */}
                <View
                  style={[
                    styles.segment,
                    {
                      backgroundColor: (isCompleted || isActive) ? activeColor : inactiveColor,
                      height: isActive ? verticalScale(5) : verticalScale(3),
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: verticalScale(12),
  },
  track: {
    flexDirection: 'row',
    gap: scale(8),
    alignItems: 'flex-end', // Align segments to bottom
  },
  stepWrapper: {
    flex: 1,
    gap: verticalScale(6),
  },
  segment: {
    borderRadius: scale(10),
    width: '100%',
  },
  label: {
    fontSize: fontScale(11),
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    marginBottom: verticalScale(2),
  },
  activeLabel: {
    fontFamily: 'Lato-Bold',
    fontSize: fontScale(12),
  },
});

export default StepIndicator;
