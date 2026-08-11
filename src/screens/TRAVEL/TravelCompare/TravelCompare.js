import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { scale, fontScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import Header from '@components/ui/Header';
import { env } from '@config/index';
import { formatNumber } from '@utils/formateNumber';
import { useGetTravelComparePlans } from '@hooks/travelflow/useTravelFlow';
import { SCREEN_NAMES } from '@constants/screenNames';
import { useToast } from '@components/ui/Toast';
import TravelComparisonCarousel from './components/TravelComparisonCarousel';

const BENEFIT_CATEGORIES = [
  {
    id: 'medical',
    label: 'Medical & Emergency Benefits',
    keys: ['medicalBenefits'],
  },
  {
    id: 'travelInconvenience',
    label: 'Travel Inconvenience Benefits',
    keys: ['luggageBenefits', 'passportBenefits'],
  },
  // { id: 'addOns', label: 'Optional Add-ons', keys: ['addOns'] },
];

const BENEFIT_NAME_ALIASES = {
  'emergency dental care': 'dental expenses',
  'dental treatment': 'dental expenses',
  'loss of passport': 'passport loss',
  'baggage delay': 'baggage loss',
};

const TravelCompare = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useThemeContext();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { showToast } = useToast();

  const {
    referenceId,
    companyIds,
    selectedPlans: initialPlans,
  } = route.params || {};

  const { mutate: fetchCompare, isPending } = useGetTravelComparePlans();
  const [compareData, setCompareData] = useState([]);

  useEffect(() => {
    if (referenceId && companyIds) {
      fetchCompare(
        { refId: referenceId, companyIds },
        {
          onSuccess: res => {
            const data = res.data?.data || res.data || [];
            setCompareData(data);
          },
        },
      );
    }
  }, [referenceId, companyIds]);

  const normalizeBenefitName = name => {
    if (!name) return '';
    const normalized = name
      .toLowerCase()
      .replace(/\band\s+other\b/gi, '')
      .replace(/&\s*other\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    return BENEFIT_NAME_ALIASES[normalized] || normalized;
  };

  const getCategorizedBenefits = useMemo(() => {
    if (!compareData.length) return [];

    return BENEFIT_CATEGORIES.map(cat => {
      const uniqueBenefits = [];
      const seenNormalized = new Set();

      compareData.forEach(plan => {
        cat.keys.forEach(key => {
          const benefits = plan?.issueInfo?.[key] || [];
          benefits.forEach(b => {
            const name = b?.benefit?.name || b?.name;
            if (!name) return;
            const normalized = normalizeBenefitName(name);
            if (!seenNormalized.has(normalized)) {
              seenNormalized.add(normalized);
              uniqueBenefits.push({
                normalized,
                display: name,
                categoryKey: key, // Keep track of which sub-key it came from
              });
            }
          });
        });
      });

      return {
        ...cat,
        benefits: uniqueBenefits,
      };
    }).filter(c => c.benefits.length > 0);
  }, [compareData]);

  if (isPending) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>Analyzing Plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Comparison Results" onBack={() => navigation.goBack()} />

      <TravelComparisonCarousel
        compareData={compareData}
        categorizedBenefits={getCategorizedBenefits}
        onBuyNowPress={item =>
          navigation.navigate(SCREEN_NAMES.TRAVEL_BUY_POLICY, {
            travelId: item?._id,
            referenceId: referenceId,
          })
        }
        formatNumber={formatNumber}
        normalizeBenefitName={normalizeBenefitName}
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
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundColor,
    },
    loadingText: {
      marginTop: 20,
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(16),
      color: theme.colors.primary,
    },
  });

export default TravelCompare;
