import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, scale, verticalScale } from '@constants/metrics';
import DatePickerModal from './CustomDatePicker';
import Calender from '@assets/icons/Calender';

const ModernDatePicker = ({
  label,
  value,
  onSelectDate,
  error,
  minDate,
  maxDate,
  placeholder = 'Select Date',
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
          styles.container,
          error && styles.errorBorder,
          showModal && styles.activeBorder,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.labelRow}>
            <Icon
              name="calendar"
              size={scale(12)}
              color={theme.colors.description}
            />
            <Text style={styles.label}>{label}</Text>
          </View>
          <Text style={[styles.value, !value && styles.placeholder]}>
            {value ? moment(value).format('DD MMM YYYY') : placeholder}
          </Text>
        </View>

        <Calender />
      </TouchableOpacity>

      {error && (
        <View style={styles.errorRow}>
          <Icon name="alert-circle" size={scale(12)} color={theme.colors.red} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <DatePickerModal
        visible={showModal}
        minDate={minDate}
        maxDate={maxDate}
        initialDate={value ? new Date(value) : new Date()}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </View>
  );
};

export default ModernDatePicker;

const getStyles = theme =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    container: {
      flexDirection: 'row',
      height: verticalScale(60),
      borderRadius: verticalScale(15),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: scale(18),
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    activeBorder: {
      borderColor: theme.colors.primary,
    },
    errorBorder: {
      borderColor: theme.colors.red,
    },
    content: {
      flex: 1,
      gap: verticalScale(2),
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(6),
    },
    label: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    value: {
      fontSize: fontScale(15),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    placeholder: {
      color: theme.colors.description + '80',
      fontFamily: 'Lato-Bold',
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(6),
      marginTop: verticalScale(6),
      marginLeft: scale(8),
    },
    errorText: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.red,
    },
  });
