import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useThemeContext } from '@theme/ThemeProvider';
import { scale, verticalScale } from '@constants/metrics';

const { width } = Dimensions.get('window');
const ITEM_GAP = scale(10);
const ITEM_WIDTH_3 = (width - scale(100)) / 3;
const ITEM_WIDTH_4 = (width - scale(110)) / 4;

const CustomOptionList = ({
  items = [],
  onPress,
  length,
  value,
  column,
  notAlign,
}) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const renderItem = ({ item }) => {
    const isSelected = value === item.value;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress?.(item)}
        style={[
          styles.optionContainer,
          { width: column === 4 ? ITEM_WIDTH_4 : ITEM_WIDTH_3 },
          isSelected && styles.optionSelected,
        ]}
      >
        <Text
          style={[styles.optionText, isSelected && styles.optionTextSelected]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={items.slice(0, length ? length : column === 4 ? 12 : 9)}
      renderItem={renderItem}
      keyExtractor={item => item.value?.toString()}
      numColumns={column === 4 ? 4 : 3}
      bounces={false}
      nestedScrollEnabled
      contentContainerStyle={[
        styles.listContent,
        notAlign && { alignItems: 'flex-start' },
      ]}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default CustomOptionList;

const getStyles = theme =>
  StyleSheet.create({
    listContent: {
      flexGrow: 1,
      gap: ITEM_GAP,
      alignItems: 'center',
    },
    columnWrapper: {
      gap: ITEM_GAP,
    },
    optionContainer: {
      height: verticalScale(38),
      backgroundColor:
        theme.colors.bgSecondary || theme.colors.backgroundColor,
      borderRadius: scale(12),
      paddingHorizontal: scale(10),
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionSelected: {
      backgroundColor: theme.colors.primary + '15',
    },
    optionText: {
      fontSize: scale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    optionTextSelected: {
      color: theme.colors.primary,
      fontFamily: 'Lato-Bold',
    },
  });
