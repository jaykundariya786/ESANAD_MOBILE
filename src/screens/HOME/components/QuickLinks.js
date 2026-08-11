import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fontScale, scale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAMES } from '@constants/screenNames';
import { Icons } from '@assets';

const QuickLinks = () => {
  const { theme } = useThemeContext();
  const styles = useStyles(theme);
  const navigation = useNavigation();

  const QUICK_LINKS = [
    {
      id: 1,
      name: 'Emergency',
      icon: Icons.Saaed,
      screen: () => navigation.navigate(SCREEN_NAMES.EMERGENCY_SCREEN),
    },
    {
      id: 2,
      name: 'Tools',
      icon: Icons.Tool,
      screen: () => navigation.navigate(SCREEN_NAMES.TOOLS_SCREEN),
    },
    {
      id: 3,
      name: 'Awards',
      icon: Icons.Awards,
      screen: () => navigation.navigate(SCREEN_NAMES.AWARDS_LINK),
    },
    {
      id: 4,
      name: 'RTA Fines',
      padding: 1,
      icon: Icons.Calculator,
      screen: () => navigation.navigate(SCREEN_NAMES.RTA_FINES),
    },
    {
      id: 5,
      name: 'Links',
      icon: Icons.Link,
      screen: () => navigation.navigate(SCREEN_NAMES.USEFUL_LINKS),
    },
    {
      id: 6,
      name: 'News',
      icon: Icons.News,
      screen: () => navigation.navigate(SCREEN_NAMES.INSURANCE_BLOGS),
    },
    {
      id: 7,
      name: 'Partners',
      icon: Icons.Partners,
      screen: () => navigation.navigate(SCREEN_NAMES.INSURANCE_PARTNERS),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Quick Links</Text>
        <Text style={styles.subheader}>
          Handy tools and resources at your fingertips
        </Text>
      </View>

      <View style={styles.grid}>
        {QUICK_LINKS.map(option => (
          <TouchableOpacity
            key={option.id}
            onPress={() => option?.screen?.()}
            style={styles.linkItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Image
                source={option.icon}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.linkName} numberOfLines={1}>
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const useStyles = theme =>
  StyleSheet.create({
    container: {
      paddingHorizontal: scale(20),
      marginTop: verticalScale(20),
    },
    headerContainer: {
      marginBottom: verticalScale(16),
    },
    header: {
      fontSize: fontScale(22),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    subheader: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      marginTop: verticalScale(2),
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(15),
    },
    linkItem: {
      width: (Dimensions.get('screen').width - scale(85)) / 4,
      alignItems: 'center',
    },
    iconCircle: {
      width: (Dimensions.get('screen').width - scale(85)) / 4,
      height: (Dimensions.get('screen').width - scale(85)) / 4,
      borderRadius: verticalScale(60),
      backgroundColor: theme.colors.backgroundColor, // White background for a modern look
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    iconImage: {
      width: '50%',
      height: '50%',
    },
    linkName: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      textAlign: 'center',
      color: theme.colors.textTertiary,
      marginTop: verticalScale(8),
      paddingHorizontal: scale(2),
    },
  });

export default QuickLinks;
