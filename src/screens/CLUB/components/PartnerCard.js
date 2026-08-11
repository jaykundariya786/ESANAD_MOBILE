import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Pressable,
  Dimensions,
} from 'react-native';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale } from '@constants/metrics';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { env } from '@config/index';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAMES } from '@constants/screenNames';

const PartnerCard = React.memo(({ item, onUpdate }) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const coverImg = `${env.IMAGE_URL}${item?.partner?.coverImg?.path}`;
  const logoImg = `${env.IMAGE_URL}${item?.partner?.logoImg?.path}`;

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate(SCREEN_NAMES.OFFERS_DETAILS, {
          partnerId: item?.partner?._id,
        })
      }
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: coverImg }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.logoOverlay}>
          {logoImg && (
            <Image
              source={{ uri: logoImg }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.categoryBadge}>
          <Text numberOfLines={1} style={styles.categoryText}>
            {item?.category}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {item?.partner?.companyName}
        </Text>

        {item?.partner?.locations?.length > 0 && (
          <View style={styles.locationContainer}>
            <Icon
              name="location-on"
              size={verticalScale(12)}
              color={theme.colors.description}
            />
            <Text numberOfLines={1} style={styles.locationText}>
              {item.partner.locations[0].location}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

export const getStyles = theme =>
  StyleSheet.create({
    card: {
      borderRadius: verticalScale(15),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: (Dimensions.get('screen').width - verticalScale(50)) / 2,
      overflow: 'hidden',
    },
    imageContainer: {
      height: verticalScale(110),
      width: '100%',
      backgroundColor: theme.colors.bgSecondary,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    logoOverlay: {
      position: 'absolute',
      bottom: verticalScale(8),
      left: verticalScale(8),
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(8),
      padding: verticalScale(4),
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    logoImage: {
      width: verticalScale(32),
      height: verticalScale(32),
    },
    contentContainer: {
      padding: verticalScale(12),
      gap: verticalScale(6),
    },
    categoryBadge: {
      backgroundColor: theme.colors.floorBgColor,
      paddingHorizontal: verticalScale(8),
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(6),
      alignSelf: 'flex-start',
    },
    categoryText: {
      fontSize: verticalScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    title: {
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      lineHeight: verticalScale(18),
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(4),
    },
    locationText: {
      fontSize: verticalScale(11),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
      flex: 1,
    },
  });

export default PartnerCard;
