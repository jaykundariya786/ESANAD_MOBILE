import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Header from '@components/ui/Header';
import CustomSearchInput from '@components/ui/CustomSearchInput';
import { fontScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import { useGetFaq } from '@hooks/profile/useProfile';
import LinearGradient from 'react-native-linear-gradient';

const FaqsScreen = ({ navigation }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useThemeContext();
  const styles = style(theme);

  const { data: faqs = [] } = useGetFaq();

  const toggleFAQ = id => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqs;
    }

    return faqs.filter(faq => {
      const searchLower = searchQuery.toLowerCase().trim();
      const questionMatch = faq.question?.toLowerCase().includes(searchLower);
      const answerMatch = faq.answer?.toLowerCase().includes(searchLower);
      return questionMatch || answerMatch;
    });
  }, [faqs, searchQuery]);

  const AnimatedFAQItem = ({ faq, isExpanded, onToggle, isFirst, isLast }) => {
    const animatedHeight = useSharedValue(0);
    const rotation = useSharedValue(0);

    React.useEffect(() => {
      animatedHeight.value = withTiming(isExpanded ? 1 : 0, {
        duration: 400,
      });
      rotation.value = withTiming(isExpanded ? 1 : 0, {
        duration: 400,
      });
    }, [isExpanded]);

    const heightStyle = useAnimatedStyle(() => {
      const maxHeight = interpolate(animatedHeight.value, [0, 1], [0, 500]);
      return {
        maxHeight,
        opacity: animatedHeight.value,
      };
    });

    const rotationStyle = useAnimatedStyle(() => {
      const rotate = interpolate(rotation.value, [0, 1], [0, 180]);
      return {
        transform: [{ rotate: `${rotate}deg` }],
      };
    });

    return (
      <View
        style={[
          styles.faqItem,
          isFirst && styles.faqItemFirst,
          isLast && styles.faqItemLast,
          isExpanded && styles.faqItemExpanded,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.faqQuestion,
            isFirst && !isExpanded && styles.faqItemFirst,
            isLast && !isExpanded && styles.faqItemLast,
          ]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.faqQuestionText,
              isExpanded && styles.faqQuestionTextActive,
            ]}
          >
            {faq.question}
          </Text>
          <Animated.View style={[styles.iconContainer, rotationStyle]}>
            <Icon
              name="chevron-down"
              size={verticalScale(20)}
              color={isExpanded ? theme.colors.primary : theme.colors.text}
            />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View style={[styles.faqAnswerContainer, heightStyle]}>
          <View style={styles.faqAnswer}>
            <View style={styles.divider} />
            <Text style={styles.faqAnswerText}>{faq.answer}</Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderFAQItem = ({ item, index }) => (
    <AnimatedFAQItem
      faq={item}
      isExpanded={expandedFAQ === index}
      onToggle={() => toggleFAQ(index)}
      isFirst={index === 0}
      isLast={index === filteredFAQs.length - 1}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Icon
          name="search"
          size={verticalScale(40)}
          color={theme.colors.description}
        />
      </View>
      <Text style={styles.emptyText}>No matches found</Text>
      <Text style={styles.emptySubText}>
        We couldn't find any results for "{searchQuery}"
      </Text>
    </View>
  );

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      colors={[theme.colors.bgLinear1, theme.colors.bgLinear2]}
      style={styles.container}
    >
      <Header onBack={() => navigation.goBack()} title="FAQs" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchWrapper}>
          <CustomSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            title="Search for help..."
          />
        </View>

        <FlatList
          data={filteredFAQs}
          renderItem={renderFAQItem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContainer}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const style = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: verticalScale(30),
    },
    searchWrapper: {
      paddingHorizontal: verticalScale(20),
      marginTop: verticalScale(20),
      marginBottom: verticalScale(16),
    },
    listContainer: {
      paddingHorizontal: verticalScale(20),
    },
    faqItem: {
      backgroundColor: theme.colors.backgroundColor, // Changed back to white/main bg for cleaner look
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    faqItemFirst: {
      borderTopLeftRadius: verticalScale(16),
      borderTopRightRadius: verticalScale(16),
    },
    faqItemLast: {
      borderBottomLeftRadius: verticalScale(16),
      borderBottomRightRadius: verticalScale(16),
    },
    faqItemExpanded: {
      borderColor: theme.colors.primary + '30',
      elevation: 5,
      zIndex: 1,
    },
    itemSeparator: {
      // height: 1,
      // backgroundColor: theme.colors.border + '10',
      // marginHorizontal: verticalScale(18),
    },
    faqQuestion: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: verticalScale(18),
      paddingVertical: verticalScale(18),
      justifyContent: 'space-between',
    },
    faqQuestionText: {
      fontSize: fontScale(15),
      color: theme.colors.text,
      fontFamily: 'Lato-Bold',
      flex: 1,
      lineHeight: fontScale(20),
    },
    faqQuestionTextActive: {
      color: theme.colors.primary,
    },
    iconContainer: {
      width: verticalScale(32),
      height: verticalScale(32),
      borderRadius: verticalScale(16),
      backgroundColor: theme.colors.bgSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: verticalScale(10),
    },
    faqAnswerContainer: {
      overflow: 'hidden',
    },
    faqAnswer: {
      paddingHorizontal: verticalScale(18),
      paddingBottom: verticalScale(20),
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border + '40',
      marginBottom: verticalScale(12),
    },
    faqAnswerText: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(22),
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(60),
    },
    emptyIconBg: {
      width: verticalScale(80),
      height: verticalScale(80),
      borderRadius: verticalScale(40),
      backgroundColor: theme.colors.bgSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    emptyText: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    emptySubText: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      marginTop: verticalScale(8),
      textAlign: 'center',
      paddingHorizontal: verticalScale(40),
    },
  });

export default FaqsScreen;
