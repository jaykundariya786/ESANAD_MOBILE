import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import Header from '@components/ui/Header';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale } from '@constants/metrics';
import LinearGradient from 'react-native-linear-gradient';
import { Awards } from '@assets/index';
import { getBottomMargin } from '@utils/paddingBottom';

const { width } = Dimensions.get('window');

const AWARDS = [
  {
    image: Awards.Award1,
    title: 'Insurance Authority Company Award',
    year: '2018',
    description:
      'Insurance Authority Company Award Digital Transformation and Smart Services (2018) Recognized for pioneering digital initiatives that modernized insurance services in the UAE. This award highlighted our commitment to innovation and improving customer experience through smart technologies.',
  },
  {
    image: Awards.Award2,
    title: 'InsureTek Technology Leader',
    year: '2018 & 2019',
    description:
      'InsureTek Insurance Technology Leader of the Year (2018 & 2019) Acknowledged for leading eSanad’s digital transformation journey, setting benchmarks for the industry. Winning this award two consecutive years reinforced our role as a front-runner in insurtech innovation',
  },
  {
    image: Awards.Award3,
    title: 'Insurance Authority Company Award',
    year: '2019',
    description:
      'Insurance Authority Company Award Digital Transformation and Smart Services (2019)Awarded for our continued excellence in digitalization, reinforcing our position as a trusted technology leader in the insurance sector. This recognition reflected our ongoing investment in smart, customer centric solutions.',
  },
  {
    image: Awards.Award4,
    title: 'InsureTek Golden Shield',
    year: '2018',
    description:
      'InsureTek Middle East & Golden Shield Motor Insurance Company of the Year (2018)Honored for excellence in motor insurance by delivering innovative and customer-focused solutions. This award demonstrated our ability to adapt and lead in one of the most competitive insurance segments.',
  },
  {
    image: Awards.Award5,
    title: 'Leadership Excellence Award',
    year: '2019',
    description:
      ' Leadership Excellence Award in Technology Innovation GCC Best Employer Brand Awards (2019)Celebrated for driving innovation and transforming the industry through cutting-edge technology. This recognition highlighted eSanad’ s legacy of innovation and leadership in the GCC region.',
  },
  {
    image: Awards.Award6,
    title: 'First AI Insurance Marketplace',
    year: 'Inaugural',
    description:
      'Established the First AI-powered Digital Insurance marketplace in the region. eSanad simplifies insurance for individuals and businesses, setting new standards of efficiency and transparency in the industry. Founder & CEO of eSanad',
  },
  {
    image: Awards.Award7,
    title: 'White Page Leadership Conclave',
    year: '2023',
    description:
      ' White Page Leadership Conclave Global Inspirational Leaders (2023)Selected among 200 leaders across Asia and EMEA for outstanding contributions to organizational growth. This recognition reflects visionary leadership and commitment to shaping the future of digital insurance.',
  },
  {
    image: Awards.Award8,
    title: 'Digital Insurance Broker of the Year',
    year: 'Golden Shield',
    description:
      'Digital Insurance Broker of the Year 9th InsureTek Golden Shield AwardsRecognized for transforming the insurance marketplace with innovative solutions and superior service delivery. This award validated eSanad’s role in redefining broker services through technology',
  },
  {
    image: Awards.Award9,
    title: 'Insurtech Leader of the Year',
    year: '2024',
    description:
      ' Insurtech Leader of the Year Finnovex Middle East Summit (2024)Awarded for driving digital excellence and shaping the future of insurtech in the region. This recognition underlines eSanad’s leadership in delivering impactful, customer-first digital solutions',
  },
  {
    image: Awards.Award10,
    title: 'Golden Shield Excellence',
    year: '2025',
    description:
      ' GAIP–InsureTek Golden Shield Excellence Awards (2025) Excellence in InnovationCelebrated for breakthrough contributions in digital transformation and innovation within the insurance sector. This recognition highlighted our role in setting new benchmarks for customer experience and industry advancement.',
  },
  {
    image: Awards.Award11,
    year: '2025',
    title: 'Leadership Impact Award',
    description:
      ' Leadership Impact Award Westford Awards (2025)Honored for impactful leadership and organizational excellence on a global platform. This award reflected our commitment to meaningful change, innovation, and creating long-term industry impact.',
  },
  {
    image: Awards.Award12,
    title: 'Rising Star of Inclusion',
    year: 'Recognized',
    description:
      ' Iminclusive Rising Star of Inclusion, Recognized for advancing diversity and inclusion in the workplace. This award highlighted our efforts to foster an inclusive culture that empowers employees and enhances collaboration.',
  },
  {
    image: Awards.Award13,
    title: 'Employee Happiness Awards',
    year: '2025',
    description:
      ' Employee Happiness Awards UAE (2025) Best Use of Technology to Engage EmployeesAcknowledged for leveraging digital tools to enhance employee satisfaction and workplace engagement. This award reflects our dedication to building a positive and tech-enabled organizational culture.',
  },
];

const AwardsLink = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const renderAwardCard = ({ item, index }) => (
    <View style={styles.showcaseCard}>
      <View style={styles.imageReveal}>
        <Image
          resizeMode="cover"
          source={item.image}
          style={styles.awardImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageOverlay}
        />
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{item.year}</Text>
        </View>
      </View>

      <View style={styles.contentSection}>
        <View style={styles.titleRow}>
          <View style={styles.indicator} />
          <Text style={styles.awardTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Header
        title="Hall of Excellence"
        navigation={navigation}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={AWARDS}
        renderItem={renderAwardCard}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.introHeader}>
            <Text style={styles.introSubtitle}>RECOGNIZING OUR JOURNEY</Text>
            <Text style={styles.introTitle}>
              A Legacy of Innovation and Trust
            </Text>
          </View>
        )}
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
    introHeader: { gap: verticalScale(0) },
    introSubtitle: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    introTitle: {
      fontSize: verticalScale(22),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    listContent: {
      paddingBottom: verticalScale(40),
      gap: verticalScale(20),
      padding: verticalScale(20),
    },
    showcaseCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(28),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    imageReveal: {
      width: '100%',
      height: verticalScale(240),
      backgroundColor: theme.colors.bgSecondary,
      position: 'relative',
    },
    awardImage: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40%',
    },
    yearBadge: {
      position: 'absolute',
      top: verticalScale(16),
      right: verticalScale(16),
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      paddingHorizontal: verticalScale(12),
      paddingVertical: verticalScale(6),
      borderRadius: verticalScale(10),
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    yearText: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    contentSection: {
      padding: verticalScale(20),
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(12),
      gap: verticalScale(12),
    },
    indicator: {
      width: 4,
      height: verticalScale(20),
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    awardTitle: {
      fontSize: verticalScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      flex: 1,
    },
    descriptionText: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: verticalScale(20),
    },
  });

export default AwardsLink;
