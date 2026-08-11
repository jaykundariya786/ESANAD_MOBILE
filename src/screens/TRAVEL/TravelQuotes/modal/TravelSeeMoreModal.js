import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, verticalScale, fontScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';

const TravelSeeMoreModal = ({ visible, onClose, onYes, onNo }) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.iconWrapper}>
                <Icon name="auto-fix" size={40} color={theme.colors.primary} />
              </View>

              <Text style={styles.title}>Want to see more Plans?</Text>

              <Text style={styles.description}>
                Discover even more plans! Expand the search to find the perfect
                coverage for your trip.
              </Text>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnOutline]}
                  onPress={onNo}
                >
                  <Text style={styles.btnTextOutline}>No, Thanks</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={onYes}
                >
                  <Text style={styles.btnTextPrimary}>Yes, Show More</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: scale(20),
    },
    modalContainer: {
      width: '100%',
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: scale(24),
      padding: scale(24),
      alignItems: 'center',
    },
    iconWrapper: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(24),
      backgroundColor: 'rgba(96, 23, 111, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    title: {
      fontSize: fontScale(20),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: verticalScale(12),
    },
    description: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      lineHeight: fontScale(20),
      marginBottom: verticalScale(32),
    },
    footer: {
      flexDirection: 'row',
      gap: scale(12),
      width: '100%',
    },
    btn: {
      flex: 1,
      height: verticalScale(54),
      borderRadius: scale(16),
      justifyContent: 'center',
      alignItems: 'center',
    },
    btnOutline: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    btnPrimary: {
      backgroundColor: theme.colors.primary,
    },
    btnTextOutline: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    btnTextPrimary: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
    },
  });

export default TravelSeeMoreModal;
