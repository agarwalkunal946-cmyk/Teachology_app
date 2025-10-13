import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '../styles/theme';

const ClearableTextInput = ({ value, onChangeText, placeholder, ...props }) => {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        {...props}
      />
      {value ? (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X color={theme.colors.textLight} size={18} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: theme.colors.solidBorder,
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    paddingLeft: 15,
    paddingRight: 40,
    fontSize: 16,
    color: theme.colors.textDark,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});

export default ClearableTextInput;