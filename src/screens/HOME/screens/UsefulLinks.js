import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Header from '@components/ui/Header';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale } from '@constants/metrics';
import { Icons } from '@assets/index';

const { width } = Dimensions.get('window');

const UsefulLinks = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const handlePress = async title => {
    const DEFAULT_LAT = 25.2048;
    const DEFAULT_LNG = 55.2708;
    try {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          Linking.openURL(
            `https://www.google.com/maps/search/${encodeURIComponent(
              title,
            )}/@${latitude},${longitude},16z`,
          );
        },
        error => {
          Linking.openURL(
            `https://www.google.com/maps/search/${encodeURIComponent(
              title,
            )}/@${DEFAULT_LAT},${DEFAULT_LNG},16z`,
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (err) {
      Linking.openURL(
        `https://www.google.com/maps/search/${encodeURIComponent(
          title,
        )}/@${DEFAULT_LAT},${DEFAULT_LNG},16z`,
      );
    }
  };

  const MinimalTile = ({ title, icon, width, height = 120 }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handlePress(title)}
      style={[styles.tileBase, { width, height: verticalScale(height) }]}
    >
      <Image source={icon} style={styles.tileIcon} resizeMode="contain" />
      <Text style={styles.tileTitle} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <Header
        title="Service Explorer"
        navigation={navigation}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.eliteGrid}>
          {/* ROW 1: PRESTIGE PAIR (50/50) */}
          <View style={styles.gridRow}>
            <MinimalTile
              title="Police Stations"
              icon={Icons.Police}
              width="48.5%"
              height={140}
            />
            <MinimalTile
              title="Hospitals"
              icon={Icons.Hospital}
              width="48.5%"
              height={140}
            />
          </View>

          {/* ROW 2: UTILITY TRIO (33/33/33) */}
          <View style={styles.gridRow}>
            <MinimalTile
              title="Food"
              icon={Icons.Food}
              width="31.5%"
              height={110}
            />
            <MinimalTile
              title="Fuel"
              icon={Icons.Fuel}
              width="31.5%"
              height={110}
            />
            <MinimalTile
              title="Mosque"
              icon={Icons.Mosque}
              width="31.5%"
              height={110}
            />
          </View>

          {/* ROW 3: LIFESTYLE TRIO (33/33/33) */}
          <View style={styles.gridRow}>
            <MinimalTile
              title="Shopping Malls"
              icon={Icons.Mall}
              width="31.5%"
              height={110}
            />
            <MinimalTile
              title="Towing"
              icon={Icons.RSA}
              width="31.5%"
              height={110}
            />
            <MinimalTile
              title="Saloon Spa"
              icon={Icons.Spa}
              width="31.5%"
              height={110}
            />
          </View>

          {/* ROW 4: SUPPORT PAIR (50/50) */}
          <View style={styles.gridRow}>
            <MinimalTile
              title="Government Office"
              icon={Icons.Government}
              width="48.5%"
              height={120}
            />

            <MinimalTile
              title="Typing Services"
              icon={Icons.Typing}
              width="48.5%"
              height={120}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      paddingBottom: verticalScale(40),
      paddingTop: verticalScale(20),
      paddingHorizontal: verticalScale(16),
    },
    eliteGrid: {
      gap: verticalScale(12),
    },
    gridRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    tileBase: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(24),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: verticalScale(12),
    },
    tileIcon: {
      width: '50%',
      height: '50%',
      marginBottom: verticalScale(12),
    },
    tileTitle: {
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    footerInfo: {
      marginTop: verticalScale(40),
      paddingHorizontal: verticalScale(20),
    },
    footerText: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      lineHeight: verticalScale(16),
    },
  });

export default UsefulLinks;
