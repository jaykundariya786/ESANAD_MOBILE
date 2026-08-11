import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, scale, fontScale } from '@constants/metrics';
import CustomButton from '@components/ui/CustomButton';

import {
  useGetAllVouchers,
  useLoyaltyPoints,
  useVoucherPurchase,
} from '@hooks/profile/useProfile';
import { useAuthStore } from '@store/authStore';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const POINT_TO_AED_RATE = 0.025;

const PurchaseVoucher = () => {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const { user } = useAuthStore();

  const {
    data: voucherCodes = [],
    refetch,
    isRefetching,
  } = useGetAllVouchers();

  const { data: loyaltyPointsData = {} } = useLoyaltyPoints();
  const { mutate: voucherPurchase } = useVoucherPurchase();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const totalRemainingPoints = loyaltyPointsData?.totalRemainingPoints || 0;
  const loyalityAED = totalRemainingPoints * POINT_TO_AED_RATE;

  const handleRedeemVoucher = voucher => {
    setSelectedVoucher(voucher);
    setShowConfirmation(true);
  };

  const handleCloseModal = () => {
    if (isLoading) return;
    setShowConfirmation(false);
  };

  const handleCreateVoucherRequest = () => {
    if (!selectedVoucher || !user?._id) return;

    setIsLoading(true);

    voucherPurchase(
      {
        userId: user._id,
        voucherCodeId: selectedVoucher?._id,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          setShowConfirmation(false);
          setSelectedVoucher(null);
          refetch();
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  const renderVoucherItem = ({ item }) => {
    const isAffordable = loyalityAED >= (item?.price || 0);
    const expiryDate = item?.expiryDate
      ? new Date(item.expiryDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        })
      : 'No Expiry';

    return (
      <View style={[styles.voucherCard, !isAffordable && styles.cardDisabled]}>
        <View style={styles.cardHeader}>
          <Text style={styles.voucherName} numberOfLines={1}>
            {item?.voucherId?.voucherName || 'Voucher'}
          </Text>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{item?.price || 0} AED</Text>
          </View>
        </View>

        <View style={styles.dashedContainer}>
          <View style={styles.dashLine} />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.description} numberOfLines={2}>
            {item?.voucherId?.description || 'Redeem for exclusive discounts'}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.expiryRow}>
              <Icon
                name="calendar"
                size={fontScale(10)}
                color={theme.colors.description}
              />
              <Text style={styles.expiryText}>{expiryDate}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.redeemAction,
                !isAffordable && styles.redeemActionDisabled,
              ]}
              onPress={() => isAffordable && handleRedeemVoucher(item)}
              disabled={!isAffordable}
            >
              <Text style={styles.redeemText}>
                {isAffordable ? 'Redeem' : 'Locked'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.walletHeader}>
      <View style={styles.walletContent}>
        <View style={styles.walletLeft}>
          <View style={styles.walletIcon}>
            <Icon name="award" size={scale(20)} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.balanceLabel}>Loyalty Balance</Text>
            <Text style={styles.balancePoints}>
              {parseFloat(totalRemainingPoints).toFixed(0)} Points
            </Text>
          </View>
        </View>
        <View style={styles.balanceValue}>
          <Text style={styles.currencyText}>AED</Text>
          <Text style={styles.aedAmount}>{loyalityAED.toFixed(2)}</Text>
        </View>
      </View>

      {totalRemainingPoints > 0 && (
        <View style={styles.conversionNote}>
          <Icon
            name="info"
            size={fontScale(10)}
            color={theme.colors.description}
          />
          <Text style={styles.conversionText}>
            Rate: 1 Point = {POINT_TO_AED_RATE} AED
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconCircle}>
        <Icon
          name="shopping-bag"
          size={scale(40)}
          color={theme.colors.border}
        />
      </View>
      <Text style={styles.emptyStateTitle}>Marketplace Empty</Text>
      <Text style={styles.emptyStateText}>
        Check back soon for new vouchers and exclusive loyalty rewards.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={voucherCodes}
        renderItem={renderVoucherItem}
        keyExtractor={(_, index) => index.toString()}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        refreshing={isRefetching}
        onRefresh={refetch}
      />

      <Modal
        animationType="fade"
        transparent
        visible={showConfirmation}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Confirm Redemption</Text>
                <Text style={styles.modalSubtitle}>
                  Points will be deducted from your wallet
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeBtn}
              >
                <Icon name="x" size={scale(20)} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedVoucher && (
              <View style={styles.confirmVoucherCard}>
                <View style={styles.confirmVoucherInfo}>
                  <Text style={styles.confirmVoucherName}>
                    {selectedVoucher?.voucherId?.voucherName}
                  </Text>
                  <Text style={styles.confirmVoucherPrice}>
                    {selectedVoucher?.price} AED
                  </Text>
                </View>
                <View style={styles.pointsCostRow}>
                  <Text style={styles.costLabel}>
                    Balance after redemption:
                  </Text>
                  <Text style={styles.remainingPoints}>
                    {(loyalityAED - selectedVoucher?.price).toFixed(2)} AED
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <CustomButton
                title="Cancel"
                onPress={handleCloseModal}
                buttonStyle={styles.modalCancelBtn}
                textStyle={styles.modalCancelText}
              />

              <CustomButton
                title={isLoading ? 'Redeeming...' : 'Confirm'}
                onPress={handleCreateVoucherRequest}
                disabled={isLoading}
                isLoading={isLoading}
                buttonStyle={styles.modalConfirmBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
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
      flexGrow: 1,
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(40),
      gap: verticalScale(10),
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },
    walletHeader: {
      marginBottom: verticalScale(5),
      gap: verticalScale(5),
    },
    walletContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.bgSecondary,
      padding: scale(16),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: theme.colors.border + '30',
    },
    walletLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12),
    },
    walletIcon: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(12),
      backgroundColor: theme.colors.backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    balanceLabel: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    balancePoints: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    balanceValue: {
      alignItems: 'flex-end',
    },
    currencyText: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    aedAmount: {
      fontSize: fontScale(20),
      fontFamily: 'Lato-Black',
      color: theme.colors.primary,
    },
    conversionNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4),
      paddingHorizontal: scale(4),
    },
    conversionText: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    cardWrapper: {},
    voucherCard: {
      width: (SCREEN_WIDTH - scale(50)) / 2,
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(15),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardDisabled: {
      opacity: 0.6,
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
      gap: verticalScale(12),
    },
    description: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textTertiary,
      lineHeight: fontScale(15),
    },
    footerRow: {
      gap: verticalScale(8),
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
    redeemAction: {
      backgroundColor: theme.colors.primary,
      paddingVertical: verticalScale(6),
      alignItems: 'center',
      borderRadius: scale(8),
    },
    redeemActionDisabled: {
      backgroundColor: theme.colors.border,
    },
    redeemText: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(40),
      marginTop: verticalScale(60),
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
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay || 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: scale(20),
    },
    modalContent: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: scale(20),
      padding: scale(20),
      gap: verticalScale(20),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    modalTitle: {
      fontSize: fontScale(20),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    modalSubtitle: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    closeBtn: {
      padding: scale(4),
    },
    confirmVoucherCard: {
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: scale(12),
      padding: scale(16),
      gap: verticalScale(12),
    },
    confirmVoucherInfo: {
      gap: verticalScale(4),
    },
    confirmVoucherName: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    confirmVoucherPrice: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Black',
      color: theme.colors.primary,
    },
    pointsCostRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: verticalScale(12),
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '30',
    },
    costLabel: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    remainingPoints: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    modalActions: {
      flexDirection: 'row',
      gap: scale(12),
    },
    modalCancelBtn: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalCancelText: {
      color: theme.colors.text,
    },
    modalConfirmBtn: {
      flex: 1.5,
    },
  });

export default PurchaseVoucher;
