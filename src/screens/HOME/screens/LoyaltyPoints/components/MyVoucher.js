import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import dayjs from 'dayjs';
import Clipboard from '@react-native-clipboard/clipboard';

import { useGetUserVouchers } from '@hooks/profile/useProfile';
import { verticalScale, scale, fontScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';

const SCREEN_WIDTH = Dimensions.get('screen').width;

const MyVoucher = () => {
  const { theme } = useThemeContext();

  const {
    data: userVouchers = [],
    refetch,
    isRefetching,
  } = useGetUserVouchers();

  const styles = getStyles(theme);

  const handleCopyCode = code => {
    if (code) {
      Clipboard.setString(code);
    }
  };

  const renderVoucherCard = ({ item }) => {
    const { voucherId, voucherCode, price = 0, expiryDate } = item || {};

    return (
      <TouchableOpacity
        style={styles.voucherCard}
        activeOpacity={0.9}
        onPress={() => console.log('Voucher selected')}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.voucherName} numberOfLines={1}>
            {voucherId?.voucherName || 'Voucher'}
          </Text>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{price} AED</Text>
          </View>
        </View>

        <View style={styles.dashedContainer}>
          <View style={styles.dashLine} />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.description} numberOfLines={2}>
            {voucherId?.description || 'Exclusive offer voucher'}
          </Text>

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.codeBadge}
              onPress={() => handleCopyCode(voucherCode)}
            >
              <Text style={styles.codeText}>{voucherCode}</Text>
              <Icon
                name="copy"
                size={fontScale(12)}
                color={theme.colors.primary}
              />
            </TouchableOpacity>

            <View style={styles.expiryRow}>
              <Icon
                name="calendar"
                size={fontScale(10)}
                color={theme.colors.description}
              />
              <Text style={styles.expiryText}>
                {expiryDate ? dayjs(expiryDate).format('DD MMM') : 'No Exp'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconCircle}>
        <Icon name="tag" size={scale(40)} color={theme.colors.border} />
      </View>
      <Text style={styles.emptyStateTitle}>No Vouchers</Text>
      <Text style={styles.emptyStateText}>
        When you purchase or earn vouchers, they will appear here for easy
        access.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={userVouchers}
        renderItem={renderVoucherCard}
        keyExtractor={(item, index) => item?._id || `voucher-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    listContent: {
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(40),
      gap: verticalScale(10),
      flexGrow: 1,
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },
    cardWrapper: {},
    voucherCard: {
      width: (SCREEN_WIDTH - scale(50)) / 2,
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(15),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardHeader: {
      padding: scale(12),
      gap: verticalScale(4),
    },
    voucherName: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    pricePill: {
      backgroundColor: theme.colors.primary + '10',
      alignSelf: 'flex-start',
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2),
      borderRadius: scale(6),
    },
    priceText: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    dashedContainer: {
      height: 1,
      overflow: 'hidden',
      marginHorizontal: scale(8),
    },
    dashLine: {
      height: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      borderRadius: 1,
    },
    cardBody: {
      padding: scale(12),
      gap: verticalScale(10),
    },
    description: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textTertiary,
      lineHeight: fontScale(15),
    },
    footerRow: {
      marginTop: verticalScale(4),
      gap: verticalScale(8),
    },
    codeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.bgSecondary,
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(6),
      borderRadius: scale(8),
      borderWidth: 0.5,
      borderColor: theme.colors.border + '30',
    },
    codeText: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      letterSpacing: 0.5,
    },
    expiryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4),
    },
    expiryText: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(40),
      marginTop: verticalScale(100),
    },
    emptyIconCircle: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      backgroundColor: theme.colors.bgSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    emptyStateTitle: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(8),
    },
    emptyStateText: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      lineHeight: fontScale(18),
    },
  });

export default MyVoucher;
