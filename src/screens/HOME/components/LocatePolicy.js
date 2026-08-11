import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { SCREEN_NAMES } from '@constants/screenNames';

const LocatePolicy = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate(SCREEN_NAMES.FETCH_POLICIES)}
      activeOpacity={0.75}
      style={styles.card}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Locate Your Policy EID</Text>
          <Text style={styles.subtitle}>
            Find your existing insurance policies with ease.
          </Text>
        </View>
        <View style={styles.iconAction}>
          <Icon
            name="arrow-right"
            size={moderateScale(14)}
            color={theme.colors.text}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    card: {
      marginHorizontal: moderateScale(20),
      marginTop: verticalScale(10),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: moderateScale(40),
      paddingVertical: verticalScale(4), // Balanced vertical breath
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: moderateScale(20),
      paddingVertical: verticalScale(12),
    },
    textContainer: {
      flex: 1,
      marginRight: moderateScale(15),
    },
    title: {
      fontSize: moderateScale(17),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      letterSpacing: -0.2,
    },
    subtitle: {
      fontSize: moderateScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.text + '90', // Slightly softer text for title contrast
      marginTop: verticalScale(2),
    },
    iconAction: {
      width: moderateScale(32),
      height: moderateScale(32),
      borderRadius: moderateScale(16),
      backgroundColor: theme.colors.highlight, // Integrated white pill
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default LocatePolicy;
