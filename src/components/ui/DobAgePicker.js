import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, scale, verticalScale } from '@constants/metrics';
import DatePickerModal from './CustomDatePicker';

const DobAgePicker = ({
  label = 'Date of Birth',
  value,
  age,
  onSelectDate,
  error,
  maxDate = new Date(),
}) => {
  const { theme } = useThemeContext();
  const [showModal, setShowModal] = useState(false);
  const styles = getStyles(theme);

  const handleConfirm = date => {
    onSelectDate(date);
    setShowModal(false);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowModal(true)}
        style={[
          styles.mainContainer,
          error && styles.errorBorder,
          showModal && styles.activeBorder,
        ]}
      >
        {/* Date Section */}
        <View style={styles.dateSection}>
          <View style={styles.labelRow}>
            <Icon
              name="calendar"
              size={scale(12)}
              color={theme.colors.description}
            />
            <Text style={styles.label}>{label}</Text>
          </View>
          <Text style={[styles.value, !value && styles.placeholder]}>
            {value ? moment(value).format('DD MMM YYYY') : 'Select Date'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Age Section */}
        <View style={styles.ageSection}>
          <Text style={styles.ageLabel}>Age</Text>
          <View style={styles.ageValueBox}>
            <Text style={styles.ageValue}>{age || '--'}</Text>
            <Text style={styles.yearsSuffix}>yrs</Text>
          </View>
        </View>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorRow}>
          <Icon name="alert-circle" size={scale(12)} color={theme.colors.red} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <DatePickerModal
        visible={showModal}
        maxDate={maxDate}
        initialDate={
          value
            ? new Date(value)
            : new Date(new Date().setFullYear(new Date().getFullYear() - 25))
        }
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </View>
  );
};

export default DobAgePicker;

const getStyles = theme =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    mainContainer: {
      flexDirection: 'row',
      height: verticalScale(68),
      borderRadius: scale(15),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: scale(18),
      alignItems: 'center',
    },
    activeBorder: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '05',
    },
    errorBorder: {
      borderColor: theme.colors.red + '80',
      backgroundColor: theme.colors.red + '05',
    },

    // Date Section
    dateSection: {
      flex: 1.8,
      justifyContent: 'center',
      gap: verticalScale(4),
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(6),
    },
    label: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    value: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    placeholder: {
      color: theme.colors.description + '80',
      fontFamily: 'Lato-Bold',
    },

    divider: {
      width: 1,
      height: '50%',
      backgroundColor: theme.colors.border + '80',
      marginHorizontal: scale(12),
    },

    // Age Section
    ageSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: verticalScale(2),
    },
    ageLabel: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
    },
    ageValueBox: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: scale(2),
    },
    ageValue: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Black',
      color: theme.colors.primary,
    },
    yearsSuffix: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
    },

    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(6),
      marginTop: verticalScale(6),
      marginLeft: scale(10),
    },
    errorText: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.red,
    },
  });
