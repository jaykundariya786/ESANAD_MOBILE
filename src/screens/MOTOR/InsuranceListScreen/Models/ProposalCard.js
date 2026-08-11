import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import { useThemeContext } from '@theme/ThemeProvider';
import { scale, verticalScale, fontScale } from '@constants/metrics';

const { width } = Dimensions.get('screen');

const ProposalCard = ({ proposalId, reviewDetails = {} }) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { userDetails = {}, carData = {} } = reviewDetails;
  const { fullName } = userDetails;
  const { make, model, year } = carData;

  const carString =
    [year, make, model].filter(Boolean).join(' ') || 'Vehicle Configuration';

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={[theme.colors.linear1, theme.colors.linear2]}
      style={styles.gradientContainer}
    >
      <View style={styles.cardLayout}>
        {/* Left Side: Avatar + Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarPill}>
            <Feather
              name="user"
              size={16}
              color={theme.colors.backgroundColor}
            />
          </View>
          <View style={styles.textStack}>
            <Text style={styles.nameText} numberOfLines={1}>
              {fullName || 'Customer Summary'}
            </Text>
            <Text style={styles.carText} numberOfLines={1}>
              {carString}
            </Text>
          </View>
        </View>

        {/* Right Side: Proposal ID Badge */}
        <View style={styles.idBadge}>
          <Text style={styles.idText}>#{proposalId || '---'}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ProposalCard;

const createStyles = theme =>
  StyleSheet.create({
    gradientContainer: {
      width: width - scale(32),
      alignSelf: 'center',
      borderRadius: scale(14),
      marginTop: verticalScale(20), // slight separation from top header
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    cardLayout: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(12),
      gap: scale(10),
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
      flex: 1,
    },
    avatarPill: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(10),
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // Sleek Glassmorphism
      justifyContent: 'center',
      alignItems: 'center',
    },
    textStack: {
      gap: verticalScale(2),
      flex: 1,
      justifyContent: 'center',
    },
    nameText: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(15),
      fontFamily: 'Lato-Bold',
    },
    carText: {
      color: 'rgba(255, 255, 255, 0.75)',
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
    },
    idBadge: {
      backgroundColor: 'rgba(0, 0, 0, 0.12)', // Subtle carved-out badge
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(6),
      borderRadius: scale(8),
      alignItems: 'flex-end',
      minWidth: scale(70),
      gap: verticalScale(1),
    },
    idLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: fontScale(8),
      fontFamily: 'Lato-Bold',
      letterSpacing: 0.5,
    },
    idText: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(12),
      fontFamily: 'Lato-Black',
    },
  });
