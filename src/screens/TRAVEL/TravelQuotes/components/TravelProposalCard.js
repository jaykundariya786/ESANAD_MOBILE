import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, fontScale } from '@constants/metrics';

const { width } = Dimensions.get('screen');

const TravelProposalCard = ({ travelInfoData = {} }) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { proposalNo, travellersInfo } = travelInfoData;

  const travelersCount = travellersInfo?.length || 0;

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={[theme.colors.linear1, theme.colors.linear2]}
      style={styles.gradientContainer}
    >
      <View style={styles.cardLayout}>
        <View style={styles.profileSection}>
          <View style={styles.avatarPill}>
            <Feather
              name="user"
              size={16}
              color={theme.colors.backgroundColor}
            />
          </View>
        </View>

        <View style={styles.idBadge}>
          <Text style={styles.idLabel}>Proposal ID</Text>
          <Text style={styles.idText}>#{proposalNo || '---'}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default TravelProposalCard;

const createStyles = theme =>
  StyleSheet.create({
    gradientContainer: {
      width: width - verticalScale(30),
      alignSelf: 'center',
      borderRadius: verticalScale(14),
    },
    cardLayout: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: verticalScale(14),
      paddingVertical: verticalScale(12),
      gap: verticalScale(10),
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(10),
    },
    avatarPill: {
      width: verticalScale(36),
      height: verticalScale(36),
      borderRadius: verticalScale(10),
      backgroundColor: theme.colors.modalOverlay,
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
    idBadge: {
      paddingVertical: verticalScale(6),
      borderRadius: verticalScale(8),
      gap: verticalScale(1),
    },
    idLabel: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
    },
    idText: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(12),
      fontFamily: 'Lato-Black',
    },
  });
