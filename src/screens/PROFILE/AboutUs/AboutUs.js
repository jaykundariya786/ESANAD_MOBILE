import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import Header from '@components/ui/Header';
import { scale, verticalScale, fontScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import { Images } from '@assets/index';
import { getBottomMargin } from '@utils/paddingBottom';

const { width } = Dimensions.get('window');

// --- Helper UI Components --- //

const SectionHeader = ({ title, subtitle, theme }) => (
  <View style={getStyles(theme).headerContainer}>
    {subtitle && (
      <Text style={getStyles(theme).sectionSubtitle}>{subtitle}</Text>
    )}
    <Text style={getStyles(theme).sectionTitle}>{title}</Text>
    <View style={getStyles(theme).headerUnderline} />
  </View>
);

const TagCloud = ({ items, theme }) => (
  <View style={getStyles(theme).tagCloudContainer}>
    {items.map((item, idx) => (
      <View key={idx} style={getStyles(theme).tagChip}>
        <Icon name="check" size={scale(12)} color={theme.colors.primary} />
        <Text style={getStyles(theme).tagText}>{item}</Text>
      </View>
    ))}
  </View>
);

const FeatureRow = ({ icon, title, description, theme }) => (
  <View style={getStyles(theme).featureRow}>
    <View style={getStyles(theme).featureIconBox}>
      <Icon name={icon} size={scale(20)} color={theme.colors.primary} />
    </View>
    <View style={getStyles(theme).featureTextContainer}>
      <Text style={getStyles(theme).featureTitle}>{title}</Text>
      {description ? (
        <Text style={getStyles(theme).featureDescription}>{description}</Text>
      ) : null}
    </View>
  </View>
);

const ValueCard = ({ icon, title, desc, theme }) => (
  <View style={getStyles(theme).valueCard}>
    <View style={getStyles(theme).valueCardHeader}>
      <View style={getStyles(theme).valueIconCircle}>
        <Icon name={icon} size={scale(18)} color={theme.colors.primary} />
      </View>
      <Text style={getStyles(theme).valueCardTitle}>{title}</Text>
    </View>
    <Text style={getStyles(theme).valueCardDesc}>{desc}</Text>
  </View>
);

// --- Main Screen --- //

const AboutUs = () => {
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const styles = getStyles(theme);

  // DATA
  const stats = [
    { value: '35+', label: 'Partners' },
    { value: '1.5M+', label: 'Customers' },
    { value: '750k+', label: 'Policies' },
  ];

  const whyChooseUs = [
    {
      title: 'Compare in 60 Seconds',
      text: 'Stop calling 10 companies. We surface real-time pricing side by side.',
    },
    {
      title: 'Always the Sharpest Price',
      text: 'Our AI scans live rates so you never overpay.',
    },
    {
      title: 'Entirely Paperless',
      text: 'From first quote to final claims cheque — all on your device.',
    },
    {
      title: 'Insurance That Rewards',
      text: 'eSanad Club members earn discounts and exclusive perks.',
    },
  ];

  const aiFeatures = [
    {
      title: 'Universal Insurer Integration',
      label: 'Every UAE Insurer. One Platform.',
    },
    { title: 'AI Quote Assistant', label: 'Your Personal Insurance Advisor.' },
    { title: 'AI OCR Document Engine', label: 'Paperwork? We Killed It.' },
  ];

  const timelineData = [
    { year: '2018', title: 'eSanad Founded' },
    { year: '2020', title: '1 Million Customers Milestone' },
    { year: '2022', title: 'AI Platform Launch' },
    { year: '2024', title: 'InsureTek Excellence Awards' },
    { year: '2025', title: 'Nationwide UAE Coverage' },
  ];

  const tags = {
    meaning: ['Support', 'Peace of Mind', 'Trust'],
    ecosystem: [
      'Insurance Hub',
      'Policy Management',
      'Claims Experience',
      'AI Assistant',
      'Loyalty',
    ],
    awards: [
      'Broker of the Year',
      'Excellence in Innovation',
      'InsurTech Leaders',
      'Tech Pioneer',
    ],
    licenses: [
      'CBUAE',
      'DHA Dubai',
      'DoH Abu Dhabi',
      'Emirates Insurance Fed.',
      'ADCCI',
    ],
  };

  return (
    <View style={styles.container}>
      <Header
        title="About eSanad"
        transparent
        noShadow
        onBack={navigation.goBack}
        textSecondarytyle={styles.absHeader}
        text2
      />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: getBottomMargin() + 40 }}
      >
        {/* HERO SECTION */}
        <View style={styles.heroWrapper}>
          <Image
            source={Images.aboutUs}
            style={styles.heroBg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', theme.colors.backgroundColor]}
            locations={[0, 1]}
            style={styles.heroOverlay}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Icon
                name="shield"
                size={scale(12)}
                color={theme.colors.highlight}
              />
              <Text style={styles.heroBadgeText}>
                UAE Licensed Broker Since 2018
              </Text>
            </View>
            <Text style={styles.heroHeading}>Transforming the standard.</Text>
            <Text style={styles.heroSubHeading}>
              A UAE-born digital platform simplifying how individuals and
              businesses discover, understand, and manage insurance.
            </Text>
          </View>
        </View>

        {/* METRICS STRIP */}
        <View style={styles.metricsStrip}>
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{s.value}</Text>
                <Text style={styles.metricLabel}>{s.label}</Text>
              </View>
              {i < stats.length - 1 && <View style={styles.metricDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* CORE VALUES */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            title="Who We Are"
            subtitle="MISSION & VISION"
            theme={theme}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            <ValueCard
              theme={theme}
              icon="compass"
              title="Our Mission"
              desc="To simplify insurance for every UAE resident and business — making it transparent, accessible, and 100% digital. Just pure clarity."
            />
            <ValueCard
              theme={theme}
              icon="eye"
              title="Our Vision"
              desc="To become the GCC's most trusted insurance platform — where every person can protect what matters most with speed and confidence."
            />
            <ValueCard
              theme={theme}
              icon="heart"
              title="Our Promise"
              desc="No hidden fees. No fine print traps. No confusing jargon. Just honest advice and fair pricing that puts you first."
            />
          </ScrollView>
        </View>

        {/* WHY CHOOSE US */}
        <View style={styles.sectionWrapBlue}>
          <SectionHeader
            title="Why Choose eSanad"
            subtitle="BENEFITS"
            theme={theme}
          />
          <View style={styles.gridContainer}>
            {whyChooseUs.map((item, idx) => (
              <FeatureRow
                key={idx}
                theme={theme}
                icon="check-circle"
                title={item.title}
                description={item.text}
              />
            ))}
          </View>
        </View>

        {/* AI & ECOSYSTEM */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            title="Our AI Platform"
            subtitle="TECHNOLOGY"
            theme={theme}
          />
          <View style={styles.aiCardsContainer}>
            {aiFeatures.map((f, i) => (
              <View key={i} style={styles.aiCard}>
                <View style={styles.aiGlow} />
                <Text style={styles.aiTitle}>{f.title}</Text>
                <Text style={styles.aiLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tagSection}>
            <Text style={styles.tagSectionTitle}>The Ecosystem</Text>
            <TagCloud theme={theme} items={tags.ecosystem} />
          </View>
        </View>

        {/* TIMELINE */}
        <View style={styles.sectionWrapLight}>
          <SectionHeader title="Our Journey" subtitle="HISTORY" theme={theme} />
          <View style={styles.timelineBox}>
            {timelineData.map((item, i) => (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineNode}>
                  <View style={styles.timelineDot} />
                  {i < timelineData.length - 1 && (
                    <View style={styles.timelinePath} />
                  )}
                </View>
                <View style={styles.timelineData}>
                  <Text style={styles.timelineYear}>{item.year}</Text>
                  <Text style={styles.timelineEvent}>{item.title}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CEO INSIGHT */}
        <View style={styles.ceoSectionWrap}>
          <View style={styles.ceoCard}>
            <View style={styles.ceoAvatarWrapper}>
              <Image source={Images.anus} style={styles.ceoAvatarFloating} />
            </View>
            <Text style={styles.ceoNameFloating}>Anas Mistareehi</Text>
            <Text style={styles.ceoRoleFloating}>Founder & CEO</Text>
            <Text style={styles.ceoQuoteFloating}>
              “Insurance should empower people with clarity and confidence.
              Technology allows us to simplify protection and make insurance
              more accessible for everyone.”
            </Text>
            <View style={styles.ceoDivider} />
            <Text style={styles.ceoBioFloating}>
              Over 20 years of expertise across the UAE's top-tier insurance
              institutions. Bridging the gap between traditional underwriting
              security and modern technological convenience.
            </Text>
          </View>
        </View>

        {/* AWARDS & RECOGNITION */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            title="Licenses & Recognition"
            subtitle="VERIFIED"
            theme={theme}
          />

          <Text style={styles.miniHeader}>Regulatory Approvals</Text>
          <TagCloud theme={theme} items={tags.licenses} />

          <Text style={[styles.miniHeader, { marginTop: verticalScale(20) }]}>
            Industry Awards
          </Text>
          <TagCloud theme={theme} items={tags.awards} />
        </View>

        {/* CONTACT CTA */}
        <View style={styles.ctaWrapper}>
          <Text style={styles.ctaHeader}>Need Assistance?</Text>
          <Text style={styles.ctaSubtitle}>
            Our team is always ready to guide you through your insurance
            journey.
          </Text>

          <View style={styles.ctaActionRow}>
            <TouchableOpacity
              style={styles.ctaActionBtn}
              onPress={() => Linking.openURL('tel:600500888')}
            >
              <Icon
                name="phone"
                size={scale(20)}
                color={theme.colors.backgroundColor}
              />
              <Text style={styles.ctaActionText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutUs;

// --- Premium Styles --- //

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    absHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },

    // Header Components
    headerContainer: {
      marginBottom: verticalScale(24),
    },
    sectionSubtitle: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginBottom: verticalScale(4),
    },
    sectionTitle: {
      fontSize: fontScale(24),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    headerUnderline: {
      width: scale(40),
      height: 3,
      backgroundColor: theme.colors.primary,
      marginTop: verticalScale(8),
      borderRadius: 2,
    },

    // Hero
    heroWrapper: {
      width: width,
      height: verticalScale(400),
      justifyContent: 'flex-end',
      position: 'relative',
    },
    heroBg: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
    heroContent: {
      paddingHorizontal: scale(24),
      paddingBottom: verticalScale(40),
      zIndex: 2,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignSelf: 'flex-start',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: scale(20),
      marginBottom: verticalScale(16),
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    heroBadgeText: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginLeft: scale(6),
    },
    heroHeading: {
      fontSize: fontScale(32),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      marginBottom: verticalScale(8),
      lineHeight: fontScale(38),
    },
    heroSubHeading: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.text,
    },

    // Metrics Strip
    metricsStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: scale(20),
      marginTop: -verticalScale(20),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: scale(16),
      paddingVertical: verticalScale(20),
      paddingHorizontal: scale(10),
    },
    metricItem: {
      flex: 1,
      alignItems: 'center',
    },
    metricValue: {
      fontSize: fontScale(20),
      fontFamily: 'Lato-Black',
      color: theme.colors.primary,
      marginBottom: verticalScale(2),
    },
    metricLabel: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
    },
    metricDivider: {
      width: 1,
      height: '70%',
      backgroundColor: theme.colors.border + '50',
    },

    // Layout Sections
    sectionWrap: {
      paddingHorizontal: scale(24),
      marginTop: verticalScale(40),
    },
    sectionWrapBlue: {
      marginTop: verticalScale(40),
      paddingHorizontal: scale(24),
      paddingVertical: verticalScale(30),
      backgroundColor: theme.colors.primary + '08', // Super light tint
    },
    sectionWrapLight: {
      marginTop: verticalScale(40),
      paddingHorizontal: scale(24),
      paddingVertical: verticalScale(30),
      backgroundColor: theme.colors.bgSecondary,
    },

    horizontalScroll: {
      gap: scale(16),
      paddingRight: scale(24),
    },

    // Premium Cards (Values)
    valueCard: {
      width: width * 0.75,
      backgroundColor: theme.colors.backgroundColor,
      padding: scale(24),
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: theme.colors.border + '40',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    valueCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    valueIconCircle: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: scale(12),
    },
    valueCardTitle: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    valueCardDesc: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(22),
    },

    // Feature Rows
    gridContainer: {
      gap: verticalScale(16),
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    featureIconBox: {
      marginTop: verticalScale(2),
      width: scale(32),
      height: scale(32),
      borderRadius: scale(8),
      backgroundColor: theme.colors.backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border + '50',
    },
    featureTextContainer: {
      flex: 1,
      marginLeft: scale(16),
    },
    featureTitle: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(4),
    },
    featureDescription: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(20),
    },

    // AI Box
    aiCardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(10),
      marginBottom: verticalScale(20),
    },
    aiCard: {
      width: '48%',
      backgroundColor: theme.colors.bgSecondary,
      padding: scale(16),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: theme.colors.border + '30',
      position: 'relative',
      overflow: 'hidden',
    },
    aiGlow: {
      position: 'absolute',
      width: scale(50),
      height: scale(50),
      borderRadius: scale(25),
      backgroundColor: theme.colors.primary + '20',
      top: -20,
      right: -20,
    },
    aiTitle: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(4),
      zIndex: 2,
    },
    aiLabel: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.primary,
      zIndex: 2,
    },

    // Tags
    tagSection: {
      marginTop: verticalScale(10),
    },
    tagSectionTitle: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      marginBottom: verticalScale(12),
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    tagCloudContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(8),
    },
    tagChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.bgSecondary,
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(8),
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: theme.colors.border + '50',
    },
    tagText: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginLeft: scale(6),
    },
    miniHeader: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(12),
    },

    // Timeline Path
    timelineBox: {
      marginTop: verticalScale(10),
    },
    timelineRow: {
      flexDirection: 'row',
      marginBottom: verticalScale(24),
    },
    timelineNode: {
      alignItems: 'center',
      width: scale(20),
      marginRight: scale(16),
    },
    timelineDot: {
      width: scale(14),
      height: scale(14),
      borderRadius: scale(7),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 3,
      borderColor: theme.colors.primary,
      zIndex: 10,
    },
    timelinePath: {
      position: 'absolute',
      width: 2,
      backgroundColor: theme.colors.primary + '30',
      top: verticalScale(14),
      bottom: -verticalScale(24),
    },
    timelineData: {
      flex: 1,
      paddingTop: verticalScale(2),
    },
    timelineYear: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Black',
      color: theme.colors.primary,
      marginBottom: verticalScale(2),
    },
    timelineEvent: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },

    // CEO Card
    ceoSectionWrap: {},
    ceoCard: {
      backgroundColor: theme.colors.backgroundColor, // Replaced heavy gradient
      borderRadius: scale(24),
      padding: scale(20),
      alignItems: 'center',
    },
    ceoQuoteBgIcon: {
      position: 'absolute',
      left: scale(20),
      top: scale(20),
    },
    ceoAvatarWrapper: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      backgroundColor: theme.colors.bgSecondary,
      padding: scale(4),
    },
    ceoAvatarFloating: {
      width: '100%',
      height: '100%',
      borderRadius: scale(36),
    },
    ceoNameFloating: {
      fontSize: fontScale(20),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      marginTop: verticalScale(10),
    },
    ceoRoleFloating: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      marginBottom: verticalScale(20),
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    ceoQuoteFloating: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Bold',
      fontStyle: 'italic',
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: fontScale(24),
      paddingHorizontal: scale(10),
      zIndex: 2,
    },
    ceoDivider: {
      width: scale(40),
      height: 3,
      backgroundColor: theme.colors.primary,
      marginVertical: verticalScale(20),
      borderRadius: 1.5,
    },
    ceoBioFloating: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      lineHeight: fontScale(20),
      paddingHorizontal: scale(10),
    },

    // CTA Minimal
    ctaWrapper: {
      marginHorizontal: scale(24),
      marginTop: verticalScale(40),
      padding: scale(24),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: scale(24),
      borderWidth: 1,
      borderColor: theme.colors.border + '40',
      alignItems: 'center',
    },
    ctaHeader: {
      fontSize: fontScale(22),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      marginBottom: verticalScale(8),
    },
    ctaSubtitle: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      marginBottom: verticalScale(24),
      lineHeight: fontScale(20),
    },
    ctaActionRow: {
      flexDirection: 'row',
      width: '100%',
      gap: scale(12),
    },
    ctaActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.text,
      paddingVertical: verticalScale(14),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: theme.colors.text,
      gap: scale(8),
    },
    ctaActionText: {
      fontSize: fontScale(15),
      fontFamily: 'Lato-Bold',
      color: theme.colors.backgroundColor, // Inverse color
    },
  });
