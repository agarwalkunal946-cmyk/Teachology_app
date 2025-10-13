import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import examples from '../data/toolExamples.json';
import { theme } from '../styles/theme';

const TryWithExampleButton = ({ toolName, formFields, handleInputChange, handleSelectChange, setValue, control }) => {
  const handleTryAllExamples = () => {
    const toolExamples = examples[toolName];
    if (!toolExamples) return;

    formFields.forEach(field => {
      const exampleValue = toolExamples[field.name];
      if (exampleValue !== undefined && exampleValue !== null) {
        if (field.type === 'select' || field.name === 'translateLanguage') {
            if (handleSelectChange) {
                handleSelectChange(exampleValue, field.name);
            }
            else if (setValue && control) {
                setValue(field.name, exampleValue, { shouldValidate: true });
                handleInputChange(field.name, exampleValue);
            }
        } else {
          handleInputChange(field.name, exampleValue);
        }
      }
    });
  };

  return (
    <TouchableOpacity onPress={handleTryAllExamples} style={styles.button}>
      <Text style={styles.buttonText}>Try with Example</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: theme.colors.white,
        fontWeight: '600',
        fontSize: 16,
    }
});

export default TryWithExampleButton