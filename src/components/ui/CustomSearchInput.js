import { Image, StyleSheet, TextInput, View } from 'react-native';
import React from 'react';
import { useThemeContext } from '@theme/ThemeProvider';
import { Icons } from '@assets';
import { fontScale, scale, verticalScale } from '@constants/metrics';

const CustomSearchInput = ({ value, onChange, title, container }) => {
  const { theme } = useThemeContext();
  const styles = style(theme);

  return (
    <View style={[styles.mainWrapper, container]}>
      <View style={styles.searchContainer}>
        <Image
          source={Icons.Search}
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchInput}
          placeholder={title}
          placeholderTextColor={theme.colors.description}
          value={value}
          onChangeText={onChange}
          autoCorrect={false}
          cursorColor={theme.colors.primary}
        />
      </View>
    </View>
  );
};

export default CustomSearchInput;

const style = theme =>
  StyleSheet.create({
    mainWrapper: {},
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(12),
      paddingHorizontal: scale(16),
      height: verticalScale(52),
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: scale(12),
    },
    searchIcon: {
      width: scale(25),
      height: scale(25),
    },
    searchInput: {
      flex: 1,
      fontSize: fontScale(16),
      fontFamily: 'Lato-Regular',
      color: theme.colors.text,
      height: '100%',
      paddingVertical: 0,
    },
  });
