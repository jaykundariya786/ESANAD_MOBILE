import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ImageBackground,
} from 'react-native';
import dayjs from 'dayjs';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, moderateScale } from '@constants/metrics';
import { formatNumber } from '@utils/formateNumber';
import { useAuthStore } from '@store/authStore';
import { useLoyaltyPoints } from '@hooks/profile/useProfile';
import { SCREEN_NAMES } from '@constants/screenNames';

import Header from '@components/ui/Header';
import NoData from '@components/ui/NoData';
import CoinIcon from '@assets/icons/CoinIcon';
import { Images } from '@assets/index';
import Dhiram from '@assets/NEWICONS/Dhiram';

const LoyaltyPoints = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const {
    data: loyaltyPointsData = {},
    refetch,
    isRefetching,
  } = useLoyaltyPoints();

  const { totalRemainingPoints = 0, pointsHistory = [] } =
    loyaltyPointsData || {};

  const totalEarned =
    pointsHistory?.reduce((acc, curr) => acc + (curr?.pointsGained || 0), 0) ||
    0;
  const totalRedeemed =
    pointsHistory?.reduce((acc, curr) => acc + (curr?.pointsUsed || 0), 0) || 0;

  const renderHistoryItem = ({ item }) => {
    const isGained = Boolean(item?.pointsGained);
    const points = isGained ? item?.pointsGained : item?.pointsUsed;

    return (
      <View style={styles.historyItem}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: isGained
                ? theme.colors.lableBg
                : theme.colors.redLight,
            },
          ]}
        >
          <CoinIcon width={verticalScale(20)} height={verticalScale(20)} />
        </View>
        <View style={styles.historyContent}>
          <Text numberOfLines={1} style={styles.historyActivity}>
            {item?.activity || 'Transaction'}
          </Text>
          <Text style={styles.historyDate}>
            {item?.createdAt
              ? dayjs(item.createdAt).format('DD MMM, YYYY • HH:mm')
              : '-'}
          </Text>
        </View>
        <View style={styles.historyValue}>
          <Text
            style={[
              styles.pointsText,
              { color: isGained ? theme.colors.lableText : theme.colors.red },
            ]}
          >
            {isGained ? '+' : '-'}
            {formatNumber(points)}
          </Text>
        </View>
      </View>
    );
  };

  const VirtualCard = () => (
    <LinearGradient
      colors={[theme.colors.linear1, theme.colors.linear2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardContainer}
    >
      <View style={styles.virtualCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardBrand}>eSanad Reward</Text>
            <Text style={styles.cardType}>Premium Member</Text>
          </View>
          <CoinIcon width={verticalScale(40)} height={verticalScale(40)} />
        </View>

        <View style={styles.cardBalanceSection}>
          <Text style={styles.cardBalanceLabel}>Available Balance</Text>
          <View style={styles.cardBalanceValueRow}>
            <View style={styles.cardCurrency}>
              <Dhiram />
            </View>
            <Text style={styles.cardBalanceValue}>
              {formatNumber(totalRemainingPoints)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardNumber}>{dayjs().format('MM/YY')}</Text>
          <View style={styles.cardStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const StatBox = ({ label, value, color }) => (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, { color }]}>{formatNumber(value)}</Text>
        <Text style={styles.statUnit}>pts</Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.listHeaderContainer}>
      <VirtualCard />

      <View style={styles.statsContainer}>
        <StatBox
          label="Total Earned"
          value={totalEarned}
          color={theme.colors.lableText}
        />
        <View style={styles.statDivider} />
        <StatBox
          label="Total Spent"
          value={totalRedeemed}
          color={theme.colors.red}
        />
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Activity History</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Credit Points" onBack={navigation.goBack} />

      <FlatList
        data={[...pointsHistory]?.reverse()}
        renderItem={renderHistoryItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<NoData />}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor, // White background for clean look
    },
    listContent: {
      flexGrow: 1,
      padding: verticalScale(20),
      paddingBottom: verticalScale(40),
    },
    listHeaderContainer: {
      flex: 1,
    },
    cardContainer: {
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      marginBottom: verticalScale(15),
      borderRadius: verticalScale(24),
    },
    virtualCard: {
      padding: verticalScale(24),
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardBrand: {
      fontSize: verticalScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
      letterSpacing: 1,
    },
    cardType: {
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textSecondary,
      marginTop: verticalScale(2),
    },
    cardBalanceSection: {
      marginVertical: verticalScale(20),
    },
    cardBalanceLabel: {
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    cardBalanceValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: verticalScale(8),
      gap: verticalScale(10),
    },
    cardCurrency: {
      width: verticalScale(28),
      height: verticalScale(28),
    },
    cardBalanceValue: {
      fontSize: moderateScale(42),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardNumber: {
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
      letterSpacing: 2,
    },
    cardStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.lableBg,
      paddingHorizontal: verticalScale(10),
      paddingVertical: verticalScale(4),
      borderRadius: verticalScale(12),
      gap: verticalScale(6),
    },
    statusDot: {
      width: verticalScale(6),
      height: verticalScale(6),
      borderRadius: verticalScale(3),
      backgroundColor: theme.colors.lableText,
    },
    statusText: {
      fontSize: verticalScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(20),
      padding: verticalScale(16),
      alignItems: 'center',
      marginBottom: verticalScale(32),
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      height: verticalScale(30),
      backgroundColor: theme.colors.border,
    },
    statLabel: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
      marginBottom: verticalScale(4),
    },
    statValueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: verticalScale(2),
    },
    statValue: {
      fontSize: moderateScale(20),
      fontFamily: 'Lato-Bold',
    },
    statUnit: {
      fontSize: verticalScale(10),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    sectionTitle: {
      fontSize: verticalScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    viewAllText: {
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    historyItem: {
      flexDirection: 'row',
      paddingVertical: verticalScale(12),
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
    },
    iconBox: {
      width: verticalScale(44),
      height: verticalScale(44),
      borderRadius: verticalScale(12),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: verticalScale(16),
    },
    historyContent: {
      flex: 1,
    },
    historyActivity: {
      fontSize: verticalScale(15),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(4),
    },
    historyDate: {
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    historyValue: {
      alignItems: 'flex-end',
    },
    pointsText: {
      fontSize: verticalScale(16),
      fontFamily: 'Lato-Bold',
    },
  });

export default LoyaltyPoints;
