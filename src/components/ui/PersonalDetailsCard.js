import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, scale, verticalScale } from '@constants/metrics';
import moment from 'moment';

const PersonalDetailsCard = ({ data, onEdit }) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const items = [
    { label: 'Full Name', value: data.name, icon: 'user' },
    { label: 'Email', value: data.email, icon: 'mail' },
    {
      label: 'Birth Date',
      value: data.dateOfBirth
        ? moment(data.dateOfBirth).format('DD MMM YYYY')
        : '--',
      icon: 'calendar',
    },
    { label: 'Nationality', value: data.nationality, icon: 'globe' },
  ];

  return (
    <View style={styles.container}>
      {/* Dynamic Grid Layout */}
      <View style={styles.grid}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.itemHeader}>
              <Icon
                name={item.icon}
                size={scale(10)}
                color={theme.colors.primary}
              />
              <Text style={styles.label}>{item.label}</Text>
            </View>
            <Text style={styles.value} numberOfLines={1}>
              {item.value || 'Not set'}
            </Text>
          </View>
        ))}
      </View>

      {/* Modern Float Edit Button */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={onEdit}
        activeOpacity={0.8}
      >
        <Icon name="edit-2" size={scale(12)} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default PersonalDetailsCard;

const getStyles = theme =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.backgroundColor, // Pure Surface
      borderRadius: scale(15),
      padding: scale(15),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: verticalScale(16),
    },
    item: {
      width: '40%', // 2 Column Layout
      gap: verticalScale(4),
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(5),
    },
    label: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
    },
    value: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      lineHeight: fontScale(18),
    },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: scale(8),
      backgroundColor: theme.colors.bgSecondary, // Very subtle tint
      borderRadius: scale(14),
      borderWidth: 1,
      borderColor: theme.colors.primary,
      position: 'absolute',
      top: verticalScale(15),
      right: verticalScale(15),
      width: scale(30),
      height: scale(30),
    },
    editText: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
  });
