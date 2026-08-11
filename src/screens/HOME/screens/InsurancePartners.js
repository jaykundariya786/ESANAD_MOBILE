import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Header from '@components/ui/Header';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, moderateScale } from '@constants/metrics';
import { env } from '@config/index';
import { getBottomMargin } from '@utils/paddingBottom';
import { COMPNAY_LIST } from '@constants/compnayJson';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - moderateScale(46)) / 3;

const InsurancePartners = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const partners = COMPNAY_LIST.filter(
    c => c.isEsanadPartner && c.availableOnEsanad,
  );

  const renderItem = ({ item }) => {
    const imageUrl =
      item.logoUrl ||
      (item.logoImg?.path ? `${env.API_URL}${item.logoImg.path}` : null);
    const companyName = item.tradingName || item.companyName;
    const id = item.slug || item.apiId || item._id;

    return (
      <TouchableOpacity
        style={styles.partnerCard}
        onPress={() => Linking.openURL(`${env.URL}/insurance-company/${id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.imageWrapper}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderLogo}>
              <Text style={styles.placeholderText}>
                {companyName?.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.partnerName} numberOfLines={1}>
          {companyName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <Header
        title="Insurance Partners"
        navigation={navigation}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={partners}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.slug || item.apiId || item._id || index.toString()
        }
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    listContent: {
      paddingHorizontal: moderateScale(12),
      paddingVertical: verticalScale(20),
      paddingBottom: getBottomMargin() + verticalScale(30),
    },
    columnWrapper: {
      justifyContent: 'flex-start',
      gap: moderateScale(10),
      marginBottom: verticalScale(10),
    },
    partnerCard: {
      width: ITEM_WIDTH,
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: moderateScale(24),
      padding: moderateScale(10),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    imageWrapper: {
      width: '100%',
      height: moderateScale(65),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: verticalScale(8),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: moderateScale(16),
      padding: moderateScale(8),
    },
    logoImage: {
      width: '100%',
      height: '100%',
    },
    placeholderLogo: {
      width: moderateScale(34),
      height: moderateScale(34),
      backgroundColor: theme.colors.border,
      borderRadius: moderateScale(17),
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      fontSize: moderateScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    partnerName: {
      fontSize: moderateScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
  });

export default InsurancePartners;
