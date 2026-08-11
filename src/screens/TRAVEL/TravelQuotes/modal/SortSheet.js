import React, { useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Feather from 'react-native-vector-icons/Feather';

import { scale, verticalScale, fontScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended', icon: 'star' },
  { label: 'Price: Low to High', value: 'low_to_high', icon: 'trending-up' },
  { label: 'Price: High to Low', value: 'high_to_low', icon: 'trending-down' },
  { label: 'Best Coverage', value: 'best_coverage', icon: 'shield' },
  { label: 'Protection Score', value: 'protection_score', icon: 'shield' },
];

const SortSheet = ({ visible, onClose, currentSort, onSelect }) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.rootView}>
        <View style={styles.overlay}>
          {/* Dismissible empty space */}
          <TouchableOpacity
            style={styles.dismissArea}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={[styles.sheetContent, { height: SCREEN_HEIGHT * 0.45 }]}>
            <View style={styles.grabberPill} />

            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Sort Quotes</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.sortContainer}>
                {SORT_OPTIONS.map(option => {
                  const isActive = currentSort === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.sortRow}
                      onPress={() => {
                        onSelect(option.value);
                        onClose();
                      }}
                      activeOpacity={0.8}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <Feather
                          name={option.icon}
                          size={18}
                          color={
                            isActive
                              ? theme.colors.primary
                              : theme.colors.description
                          }
                        />
                        <Text
                          style={[
                            styles.sortLabel,
                            isActive && styles.sortLabelActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioRing,
                          isActive && styles.radioRingActive,
                        ]}
                      >
                        {isActive && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default SortSheet;

const getStyles = theme =>
  StyleSheet.create({
    rootView: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    dismissArea: {
      flex: 1,
    },
    sheetContent: {
      backgroundColor: theme.colors.backgroundColor,
      borderTopLeftRadius: scale(24),
      borderTopRightRadius: scale(24),
      paddingTop: verticalScale(10),
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
    },
    grabberPill: {
      width: scale(40),
      height: verticalScale(4),
      backgroundColor: theme.colors.border,
      borderRadius: scale(2),
      alignSelf: 'center',
      marginBottom: verticalScale(10),
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: scale(20),
      paddingBottom: verticalScale(12),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(15),
    },
    closeBtn: {
      padding: scale(4),
      backgroundColor: theme.colors.floorBgColor,
      borderRadius: scale(12),
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: verticalScale(50),
    },
    sortContainer: {
      paddingVertical: verticalScale(10),
    },
    sortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(20),
    },
    sortLabel: {
      fontSize: fontScale(15),
      color: theme.colors.text,
      fontFamily: 'Lato-Regular',
    },
    sortLabelActive: {
      color: theme.colors.primary,
      fontFamily: 'Lato-Bold',
    },
    radioRing: {
      width: scale(20),
      height: scale(20),
      borderRadius: scale(10),
      borderWidth: 1.5,
      borderColor: theme.colors.description,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioRingActive: {
      borderColor: theme.colors.primary,
    },
    radioDot: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(5),
      backgroundColor: theme.colors.primary,
    },
  });
