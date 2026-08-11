import React, { useMemo } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { useThemeContext } from '@theme/ThemeProvider';
import {
  fontScale,
  scale,
  verticalScale,
  moderateScale,
} from '@constants/metrics';
import { Images, Insurance, Icons } from '@assets/index';
import { SCREEN_NAMES } from '@constants/screenNames';
import Header from '@components/ui/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const InsuranceFor = () => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const navigation = useNavigation();

  const DATA = useMemo(
    () => [
      {
        icon: Icons.Self,
        name: 'Self',
        description: 'Ideal for individuals & working professionals',
      },
      {
        icon: Icons.SelfInve,
        name: 'Self (Investor)',
        description: 'Best for investor visa or partner visa holders',
      },
      {
        icon: Icons.SelfDepen,
        name: 'Self (Investor) &\nDependent',
        description: 'Complete care for investor & their dependents',
      },
      {
        icon: Icons.InvesterOnly,
        name: 'Self & Dependent',
        description: 'Protect yourself along with spouse/children',
      },
      {
        icon: Icons.DepenOnly,
        name: 'Dependent Only',
        description: 'Covers children, parents or sponsored members',
      },

      {
        icon: Icons.DepenOnly,
        name: 'Investor’s\nDependent Only',
        description: 'Only cover your investor family members',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation],
  );

  const handleInsuranceFor = val => {
    if (val) {
      navigation.navigate(SCREEN_NAMES.HEALTH_FLOW_SCREEN, { type: val });
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        <Image
          source={Insurance.HealthInsurance}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />

        <View style={styles.headerBar}>
          <Header
            title="Health Insurance"
            onBack={() => navigation.goBack()}
            transparent
            noShadow
            text2
          />
        </View>

        <View style={styles.heroContent}>
          <View style={styles.promoBadge}>
            <Icon
              name="heart"
              size={scale(14)}
              color={theme.colors.highlight}
            />
            <Text style={styles.promoText}>Comprehensive Care</Text>
          </View>
          <Text style={styles.heroTitle}>Protect Your{'\n'}Wellbeing</Text>
          <Text style={styles.heroSubtitle}>
            Compare & secure health insurance seamlessly
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Who's this insurance for?</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the specific tier of coverage map you require.
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: verticalScale(10),
          }}
        >
          {DATA.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => handleInsuranceFor(item.name)}
                style={{
                  width:
                    (Dimensions.get('window').width - verticalScale(60)) / 3,
                  backgroundColor: theme.colors.backgroundColor,
                  borderRadius: verticalScale(15),
                  padding: scale(15),
                  borderWidth: 1,
                  gap: verticalScale(10),
                  borderColor: theme.colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={item.icon}
                  style={{ width: scale(40), height: scale(40) }}
                  resizeMode="contain"
                />

                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: fontScale(11),
                    fontFamily: 'Lato-Bold',
                    textAlign: 'center',
                  }}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default InsuranceFor;

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgLinear2,
    },

    // ── Hero Section ──
    heroContainer: {
      height: SCREEN_WIDTH,
      width: SCREEN_WIDTH,
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.modalOverlay,
    },
    headerBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    heroContent: {
      position: 'absolute',
      bottom: verticalScale(28),
      left: scale(24),
      right: scale(24),
    },
    promoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary + '70',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: verticalScale(20),
      marginBottom: verticalScale(5),
      gap: scale(6),
    },
    promoText: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
    },
    heroTitle: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(30),
      fontFamily: 'Lato-Black',
      lineHeight: fontScale(36),
      marginBottom: verticalScale(8),
    },
    heroSubtitle: {
      color: theme.colors.textSecondary + '99',
      fontSize: fontScale(15),
      fontFamily: 'Lato-Regular',
    },

    content: {
      flex: 1,
      padding: verticalScale(20),
      paddingBottom: verticalScale(50),
    },

    sectionHeader: {
      marginBottom: verticalScale(15),
      gap: verticalScale(4),
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: fontScale(20),
      fontFamily: 'Lato-Bold',
    },
    sectionSubtitle: {
      color: theme.colors.description,
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
    },

    methodsWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(12),
      width: '100%',
      justifyContent: 'space-between',
    },
    methodCard: {
      width: '48%',
      borderRadius: verticalScale(20),
      backgroundColor: theme.colors.backgroundColor,
      padding: scale(16),
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    methodCardPrimary: {
      borderColor: theme.colors.primary + '50',
    },
    methodIconBox: {
      width: scale(56),
      height: scale(56),
      borderRadius: scale(28),
      backgroundColor: theme.colors.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(12),
    },
    methodInfo: {
      alignItems: 'center',
      width: '100%',
      flex: 1, // Forces Action Indicator downwards
    },
    methodTitle: {
      color: theme.colors.text,
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      textAlign: 'center',
      marginBottom: verticalScale(6),
    },
    methodDescription: {
      color: theme.colors.description,
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      lineHeight: fontScale(16),
      textAlign: 'center',
      marginBottom: verticalScale(14),
    },
    actionIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4),
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: scale(20),
      marginTop: 'auto', // Pushes to the bottom bound seamlessly
    },
    actionText: {
      color: theme.colors.primary,
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
    },
  });
