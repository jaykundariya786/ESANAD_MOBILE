import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeContext } from '@theme/ThemeProvider';
import { scale, verticalScale } from '@constants/metrics';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const InlineSelect = ({ label, value, items = [], onSelect }) => {
  const { theme } = useThemeContext();
  const [expanded, setExpanded] = useState(value ? false : true);
  const [search, setSearch] = useState('');
  const styles = getStyles(theme);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
    setSearch('');
  };

  const handlePick = val => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onSelect(val);
    setExpanded(false);
    setSearch('');
  };

  const filtered = search
    ? items.filter(i =>
        (i.label || i.value)
          ?.toString()
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : items;

  return (
    <View style={styles.wrapper}>
      {/* Trigger */}
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.7}
        style={[styles.trigger, expanded && styles.triggerOpen]}
      >
        <View style={styles.triggerLeft}>
          <Text style={styles.triggerLabel}>{label}</Text>
          {value && <Text style={styles.triggerValue}>{value}</Text>}
        </View>
        <Icon
          name={expanded ? 'x' : 'chevron-down'}
          size={18}
          color={expanded ? theme.colors.primary : theme.colors.description}
        />
      </TouchableOpacity>

      {/* Expanded Options */}
      {expanded && (
        <View style={styles.optionsPanel}>
          {/* Quick search — only for large lists */}
          {items.length > 10 && (
            <View style={styles.searchRow}>
              <Icon name="search" size={16} color={theme.colors.description} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${label.toLowerCase()}...`}
                placeholderTextColor={theme.colors.description}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          )}

          {/* Horizontal scrolling options */}
          <FlatList
            data={filtered}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.value?.toString()}
            contentContainerStyle={styles.optionsList}
            renderItem={({ item }) => {
              const isSelected = value === item.value;
              return (
                <TouchableOpacity
                  onPress={() => handlePick(item.value)}
                  activeOpacity={0.7}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No match</Text>}
          />
        </View>
      )}
    </View>
  );
};

export default InlineSelect;

const getStyles = theme =>
  StyleSheet.create({
    wrapper: {
      overflow: 'hidden',
      borderRadius: scale(18),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(16),
      paddingHorizontal: scale(18),
      backgroundColor: theme.colors.backgroundColor,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },

    triggerLeft: {
      flex: 1,
      gap: verticalScale(2),
    },
    triggerLabel: {
      fontSize: scale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    triggerValue: {
      fontSize: scale(17),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginTop: verticalScale(2),
    },
    optionsPanel: {
      backgroundColor: theme.colors.bgSecondary,
      borderBottomLeftRadius: scale(18),
      borderBottomRightRadius: scale(18),
      paddingBottom: verticalScale(14),
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: scale(12),
      marginTop: verticalScale(8),
      marginBottom: verticalScale(4),
      paddingHorizontal: scale(12),
      borderRadius: scale(12),
      backgroundColor: theme.colors.backgroundColor,
      gap: scale(8),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: scale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.text,
      paddingVertical: verticalScale(10),
    },
    optionsList: {
      paddingHorizontal: scale(12),
      paddingTop: verticalScale(10),
      gap: scale(8),
    },
    optionItem: {
      paddingHorizontal: scale(18),
      paddingVertical: verticalScale(10),
      borderRadius: scale(25),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionItemSelected: {
      backgroundColor: theme.colors.primary,
    },
    optionText: {
      fontSize: scale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.text,
    },
    optionTextSelected: {
      color: theme.colors.textSecondary,
      fontFamily: 'Lato-Bold',
    },
    emptyText: {
      fontSize: scale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      paddingHorizontal: scale(6),
    },
  });
