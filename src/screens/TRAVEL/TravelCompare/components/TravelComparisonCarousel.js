import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, scale, fontScale } from '@constants/metrics';
import { env } from '@config/index';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { CustomAccordion } from '@components/ui/CustomAccordion';
import CustomButton from '@components/ui/CustomButton';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const CardItem = ({
  item,
  index,
  compareData,
  categorizedBenefits,
  onBuyNowPress,
  formatNumber,
  carouselRef,
  normalizeBenefitName,
}) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  // Prepare basic information
  const basicInfo = [
    {
      label: 'Price',
      value: `AED ${formatNumber(item.price)}`,
    },
    {
      label: 'Company',
      value: item?.companyId?.companyName || item?.companyName || '-',
    },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.cardContent}
    >
      <LinearGradient
        colors={[
          theme.colors.bgLinear2,
          theme.colors.floorBgColor2,
          theme.colors.bgLinear2,
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={[styles.navButton, index === 0 && styles.navButtonDisabled]}
          onPress={() => {
            if (index > 0) {
              carouselRef.current?.snapToPrev();
            }
          }}
          disabled={index === 0}
        >
          <Icon
            name="chevron-left"
            size={30}
            color={index === 0 ? theme.colors.border : theme.colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.companyHeader}>
          <Image
            source={{
              uri: `${env.API_URL}${
                item?.companyId?.logoImg?.path ||
                item?.company?.logoImg?.path ||
                item?.companyId?.logo?.path
              }`,
            }}
            style={styles.companyLogo}
            resizeMode="contain"
          />
          <View style={styles.headerInfo}>
            <Text style={styles.companyName} numberOfLines={1}>
              {item?.planName || item?.planId?.name || 'Insurance Company'}
            </Text>

            <CustomButton
              title="Select Plan"
              onPress={() => onBuyNowPress && onBuyNowPress(item)}
              buttonStyle={styles.buyBtn}
              textStyle={styles.buyBtnText}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            index === compareData.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={() => {
            if (index < compareData.length - 1) {
              carouselRef.current?.snapToNext();
            }
          }}
          disabled={index === compareData.length - 1}
        >
          <Icon
            name="chevron-right"
            size={30}
            color={
              index === compareData.length - 1
                ? theme.colors.border
                : theme.colors.primary
            }
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Basic Information */}
      {basicInfo.map((info, idx) => (
        <View key={idx} style={styles.infoSection}>
          <Text style={styles.infoLabel}>{info.label}</Text>
          <Text style={styles.infoValue}>{info.value}</Text>
        </View>
      ))}

      {/* Benefits Categorized */}
      {categorizedBenefits.map((category, catIdx) => (
        <CustomAccordion
          key={catIdx}
          title={category.label}
          containerStyle={styles.accordionContainer}
        >
          <View style={styles.benefitsList}>
            {category.benefits.map((benefit, benIdx) => {
              let benefitData = null;
              for (const key of category.keys) {
                benefitData = (item?.issueInfo?.[key] || []).find(
                  b =>
                    normalizeBenefitName(b?.benefit?.name || b?.name) ===
                    benefit.normalized,
                );
                if (benefitData) break;
              }

              const rawVal = benefitData?.limit || benefitData?.value;
              const isNotCovered =
                !benefitData ||
                (typeof rawVal === 'string' &&
                  rawVal.toLowerCase() === 'not covered');

              return (
                <View key={benIdx} style={styles.benefitRow}>
                  <Text style={styles.benefitName}>{benefit.display}</Text>
                  <View style={styles.benefitValue}>
                    {isNotCovered ? (
                      <Text style={styles.notCoveredText}>Not Covered</Text>
                    ) : rawVal && rawVal !== benefit.display ? (
                      <Text style={styles.valueText}>{rawVal}</Text>
                    ) : (
                      <Feather
                        name="check-circle"
                        size={16}
                        color={theme.colors.lableText}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </CustomAccordion>
      ))}
    </ScrollView>
  );
};

const TravelComparisonCarousel = ({
  compareData,
  categorizedBenefits,
  onBuyNowPress,
  formatNumber,
  normalizeBenefitName,
}) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const renderCard = ({ item, index }) => {
    return (
      <CardItem
        item={item}
        index={index}
        compareData={compareData}
        categorizedBenefits={categorizedBenefits}
        onBuyNowPress={onBuyNowPress}
        formatNumber={formatNumber}
        carouselRef={carouselRef}
        normalizeBenefitName={normalizeBenefitName}
      />
    );
  };

  if (!compareData || compareData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No comparison data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        data={compareData}
        renderItem={renderCard}
        sliderWidth={screenWidth}
        itemWidth={screenWidth - scale(32)}
        onSnapToItem={index => setActiveSlide(index)}
        inactiveSlideScale={0.95}
        inactiveSlideOpacity={0.7}
        enableMomentum={true}
        decelerationRate="fast"
      />
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    cardContent: {
      flexGrow: 1,
      gap: verticalScale(10),
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(50),
    },
    headerGradient: {
      borderRadius: verticalScale(15),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    companyHeader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      flexDirection: 'row',
      gap: scale(10),
    },
    companyLogo: {
      width: scale(80),
      height: verticalScale(40),
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: scale(8),
      padding: scale(5),
    },
    headerInfo: {
      flex: 1,
      justifyContent: 'center',
      gap: verticalScale(6),
    },
    companyName: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    buyBtn: {
      height: verticalScale(24),
      borderRadius: scale(6),
      width: scale(100),
      backgroundColor: theme.colors.primary,
    },
    buyBtnText: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
    },
    infoSection: {
      padding: scale(16),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: verticalScale(12),
    },
    infoLabel: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
    },
    infoValue: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    accordionContainer: {
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: verticalScale(12),
      overflow: 'hidden',
    },
    benefitsList: {
      paddingHorizontal: scale(15),
      paddingBottom: verticalScale(10),
    },
    benefitRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(8),
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    benefitName: {
      flex: 1,
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      marginRight: scale(10),
    },
    benefitValue: {
      flex: 1,
      alignItems: 'flex-end',
    },
    valueText: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.text,
      textAlign: 'right',
    },
    notCoveredText: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.red,
    },
    navButton: {
      width: scale(40),
      height: verticalScale(50),
      justifyContent: 'center',
      alignItems: 'center',
    },
    navButtonDisabled: {
      opacity: 0.2,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
  });

export default TravelComparisonCarousel;
