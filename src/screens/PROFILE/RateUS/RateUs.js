import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { scale, verticalScale, fontScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import Icon from 'react-native-vector-icons/Feather';
import Header from '@components/ui/Header';
import FloatingButton from '@components/ui/FloatingButton';
import FloatingLabelInput from '@components/ui/FloatingLabelInput';
import StarRating from 'react-native-star-rating-widget';
import { getBottomMargin } from '@utils/paddingBottom';

const RateUs = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const [rating, setRating] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    'Fast Scanning',
    'Easy UI',
    'Privacy',
    'Support',
    'Detailed Reports',
    'Frequent Updates',
  ];

  const toggleFeature = feature => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    // Simulate submission
    setTimeout(() => {
      setIsLoading(false);
      navigation.goBack();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Header title="Feedback" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.iconCircle}>
              <Icon name="star" size={scale(28)} color={theme.colors.primary} />
            </View>
            <Text style={styles.heroTitle}>Rate Your Experience</Text>
            <Text style={styles.heroSubtitle}>
              Your feedback helps us refine the standard of digital insurance.
              Let us know how we're doing.
            </Text>

            <View style={styles.starWrapper}>
              <StarRating
                rating={rating}
                onChange={setRating}
                starSize={scale(40)}
                color={theme.colors.star} // Premium Gold
                emptyColor={theme.colors.border}
                starStyle={styles.starIcon}
                enableHalfStar={false}
              />
            </View>
            <Text style={styles.ratingLabel}>
              {rating === 0
                ? 'Tap a star to rate'
                : rating < 3
                ? 'We will work on improving'
                : rating === 3
                ? 'It was okay'
                : 'Glad you loved it!'}
            </Text>
          </View>

          {/* Conditional Attributes based on Rating */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>What stood out for you?</Text>
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => {
                const isSelected = selectedFeatures.includes(feature);
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => toggleFeature(feature)}
                    style={[
                      styles.featureChip,
                      isSelected && styles.featureChipSelected,
                    ]}
                  >
                    {isSelected && (
                      <Icon
                        name="check"
                        size={scale(12)}
                        color={theme.colors.backgroundColor}
                        style={{ marginRight: scale(6) }}
                      />
                    )}
                    <Text
                      style={[
                        styles.featureText,
                        isSelected && styles.featureTextSelected,
                      ]}
                    >
                      {feature}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Input Section */}
          <View style={styles.sectionWrapBottom}>
            <Text style={styles.sectionTitle}>Additional Comments</Text>
            <FloatingLabelInput
              label="Share your thoughts..."
              value={feedback}
              onChangeText={setFeedback}
              numberOfLines={4}
              maxLength={500}
              customStyle={styles.textInput}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FloatingButton
        title="Submit Feedback"
        onPress={handleSubmit}
        disabled={rating === 0}
        isLoading={isLoading}
        isShowIcon
      />
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      flexGrow: 1,
      paddingTop: verticalScale(20),
      paddingBottom: verticalScale(100), // padding for floating button
      paddingHorizontal: scale(20),
    },

    // Elevated Hero Card
    heroCard: {
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: scale(20),
      padding: scale(24),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border + '40',
      marginBottom: verticalScale(30),
    },
    iconCircle: {
      width: scale(60),
      height: scale(60),
      borderRadius: scale(30),
      backgroundColor: theme.colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    heroTitle: {
      fontSize: fontScale(22),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      marginBottom: verticalScale(8),
      textAlign: 'center',
    },
    heroSubtitle: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      lineHeight: fontScale(22),
      marginBottom: verticalScale(24),
    },
    starWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    starIcon: {
      marginHorizontal: scale(2),
    },
    ratingLabel: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      marginTop: verticalScale(16),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Sections
    sectionWrap: {
      marginBottom: verticalScale(30),
    },
    sectionWrapBottom: {
      marginBottom: verticalScale(20),
    },
    sectionTitle: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(16),
    },

    // Features Cloud
    featuresContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(10),
    },
    featureChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(10),
      borderRadius: scale(20),
      backgroundColor: theme.colors.bgSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border + '50',
    },
    featureChipSelected: {
      backgroundColor: theme.colors.text, // High contrast selection
      borderColor: theme.colors.text,
    },
    featureText: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
    },
    featureTextSelected: {
      color: theme.colors.backgroundColor, // Invert
    },

    // Inputs
    textInput: {
      textAlignVertical: 'top',
      minHeight: verticalScale(100),
      paddingTop: verticalScale(12),
    },
  });

export default RateUs;
