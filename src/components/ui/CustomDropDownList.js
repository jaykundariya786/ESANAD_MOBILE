import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableWithoutFeedback,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { scale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const CustomDropDownList = React.forwardRef(
  (
    {
      title,
      data = [],
      defaultOpen = false,
      iconSize = 20,
      iconColor,
      titleStyle,
      contentStyle,
      showSearch = true,
      searchPlaceholder = 'Search...',
      renderItem,
      keyExtractor = (item, index) =>
        (item.id ?? item.value ?? index).toString(),
      onItemPress,
      errors,
      value,
      absolute,
      handleSelect,
      style,
    },
    ref,
  ) => {
    const { theme } = useThemeContext();
    const styles = getStyles(theme);

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [searchText, setSearchText] = useState('');
    const [selectedValue, setSelectedValue] = useState(value ?? title);

    const rotateAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
    const contentAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

    // Sync selectedValue with prop
    useEffect(() => {
      setSelectedValue(value ?? title);
    }, [value, title]);

    const toggleOpen = useCallback(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsOpen(prev => !prev);
    }, []);

    useEffect(() => {
      Animated.timing(rotateAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.timing(contentAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useImperativeHandle(ref, () => ({
      open: () => !isOpen && toggleOpen(),
      close: () => isOpen && toggleOpen(),
      getValue: () => selectedValue,
    }));

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const animatedHeight = contentAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 280],
    });

    const filteredData = (Array.isArray(data) ? data : []).filter(item => {
      const label = (item?.label ?? item)?.toString().toLowerCase() ?? '';
      return label.includes(searchText.toLowerCase());
    });

    const onSelect = item => {
      const val = item.value ?? item;
      setSelectedValue(val.toString());
      handleSelect?.(val);
      onItemPress?.(val);
      toggleOpen();
    };

    const hasValue = selectedValue && selectedValue !== title;

    const renderDropdownItem = ({ item }) => {
      const val = item.value ?? item;
      const isSelected = val.toString() === selectedValue;

      return (
        <TouchableOpacity
          style={[
            styles.itemContainer,
            isSelected && { backgroundColor: theme.colors.primary + '12' },
          ]}
          onPress={() => onSelect(item)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.itemText,
              isSelected && {
                color: theme.colors.primary,
                fontFamily: 'Lato-Bold',
              },
            ]}
          >
            {item.label ?? item}
          </Text>
          {isSelected && (
            <View style={styles.checkCircle}>
              <Ionicons
                name="checkmark"
                size={14}
                color={theme.colors.backgroundColor}
              />
            </View>
          )}
        </TouchableOpacity>
      );
    };

    return (
      <View style={[styles.container, style]}>
        {/* Floating Label */}
        {hasValue && <Text style={styles.floatingLabel}>{title}</Text>}

        <TouchableWithoutFeedback onPress={toggleOpen}>
          <View
            style={[
              styles.dropdown,
              isOpen && styles.dropdownOpen,
              errors && styles.dropdownError,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.selectedText,
                titleStyle,
                !hasValue && styles.placeholderText,
              ]}
            >
              {selectedValue || title}
            </Text>
            <Animated.View
              style={[styles.chevronBox, { transform: [{ rotate }] }]}
            >
              <Ionicons
                name="chevron-down"
                size={iconSize}
                color={isOpen ? theme.colors.primary : theme.colors.description}
              />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        {errors && !isOpen && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={14} color={theme.colors.red} />
            <Text style={[styles.errorText, { color: theme.colors.red }]}>
              {errors}
            </Text>
          </View>
        )}

        <Animated.View
          style={[
            styles.dropdownContent,
            {
              maxHeight: animatedHeight,
              opacity: contentAnim,
            },
            absolute && styles.absoluteDropdown,
            contentStyle,
          ]}
        >
          {showSearch && (
            <View style={styles.searchContainer}>
              <Feather
                name="search"
                size={16}
                color={theme.colors.description}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor={theme.colors.description}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          )}

          <FlatList
            data={filteredData}
            keyExtractor={keyExtractor}
            renderItem={renderItem ?? renderDropdownItem}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
            style={{ maxHeight: 250 }}
            ListEmptyComponent={
              <Text numberOfLines={1} style={styles.emptyText}>
                No items found
              </Text>
            }
          />
        </Animated.View>
      </View>
    );
  },
);

const getStyles = theme =>
  StyleSheet.create({
    container: {},
    floatingLabel: {
      fontSize: scale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      marginBottom: verticalScale(6),
      marginLeft: scale(4),
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    dropdown: {
      height: verticalScale(52),
      borderRadius: scale(16),
      paddingHorizontal: scale(16),
      backgroundColor: theme.colors.bgSecondary || theme.colors.backgroundColor,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownOpen: {
      backgroundColor: theme.colors.primary + '08',
    },
    dropdownError: {
      borderWidth: 1.5,
      borderColor: theme.colors.red,
    },
    selectedText: {
      fontSize: scale(15),
      color: theme.colors.text,
      fontFamily: 'Lato-Regular',
      flex: 1,
    },
    placeholderText: {
      color: theme.colors.description,
    },
    chevronBox: {
      width: scale(30),
      height: scale(30),
      borderRadius: scale(15),
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownContent: {
      overflow: 'hidden',
      borderRadius: scale(16),
      marginTop: verticalScale(6),
      backgroundColor: theme.colors.backgroundColor,
    },
    absoluteDropdown: {
      position: 'absolute',
      zIndex: 1,
      marginTop: verticalScale(58),
      width: '100%',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.bgSecondary || theme.colors.backgroundColor,
      borderRadius: scale(12),
      margin: scale(10),
      paddingHorizontal: scale(12),
      gap: scale(8),
    },
    searchInput: {
      flex: 1,
      paddingVertical: verticalScale(10),
      color: theme.colors.text,
      fontFamily: 'Lato-Regular',
      fontSize: scale(14),
    },
    itemContainer: {
      height: verticalScale(48),
      paddingHorizontal: scale(16),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: scale(6),
      borderRadius: scale(12),
      marginVertical: verticalScale(2),
    },
    itemText: {
      fontSize: scale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.text,
    },
    checkCircle: {
      width: scale(22),
      height: scale(22),
      borderRadius: scale(11),
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      textAlign: 'center',
      paddingVertical: verticalScale(16),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
      fontSize: scale(13),
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: verticalScale(6),
      marginLeft: scale(4),
      gap: scale(6),
    },
    errorText: {
      fontSize: scale(12),
      fontFamily: 'Lato-Regular',
    },
  });
