import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { pick, isCancel } from '@react-native-documents/picker';
import RNPickerSelect from 'react-native-picker-select';
import { theme } from '../../../styles/theme';
import InfoTooltip from "../../InfoTooltip";
import tooltips from "../../../data/fieldTooltips.json";
import TryWithExampleButton from "../TryWithExampleButton";

const languages = [ { value: "en", label: "English" }, { value: "hi", label: "Hindi" }, { value: "es", label: "Spanish" }, /* ... other languages */ ];

const TextTranslator = ({ formFields, onSubmit, loading, handleFileUpload, uploadedFiles }) => {
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({ mode: 'onChange' });
    const translateTextValue = watch("translateText");
    const isTextDisabled = uploadedFiles && uploadedFiles.length > 0;
    const isFileDisabled = !!translateTextValue;
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    useEffect(() => {
        const hasContent = uploadedFiles.length > 0 || !!translateTextValue;
        const langSelected = !!watch("translateLanguage");
        setIsSubmitEnabled(hasContent && langSelected);
    }, [watch(), uploadedFiles]);

    const handleFilePick = async () => {
        try {
            const res = await pick({
                allowMultiSelection: true,
                type: ['application/pdf', 'image/*'],
            });
            handleFileUpload({ target: { files: res } });
        } catch (err) {
            if (!isCancel(err)) {
                Alert.alert("Error", "Could not pick document.");
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.pageWrapper}>
            <View style={styles.header}>
                <View style={styles.titleContainer}><Text style={styles.titlePart1}>Content </Text><Text style={styles.titlePart2}>Translator</Text></View>
                <TryWithExampleButton toolName="TextTranslator" formFields={formFields} handleInputChange={(name, val) => setValue(name, val)} setValue={setValue} />
            </View>

            {formFields.filter(f => f.name === 'translateLanguage').map(field => (
                 <View key={field.name} style={styles.fieldWrapper}>
                    <View style={styles.labelContainer}><Text style={styles.labelText}>{field.label}</Text><InfoTooltip text={tooltips.TextTranslator?.[field.name]?.tooltip} /></View>
                    <Controller
                        control={control} name={field.name} rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                            <View style={[styles.inputBase, errors[field.name] && styles.inputError]}>
                                <RNPickerSelect onValueChange={onChange} items={languages} value={value} placeholder={{ label: 'Select a language...', value: null }} />
                            </View>
                        )}
                    />
                </View>
            ))}

            <View style={styles.fieldWrapper}>
                <View style={styles.labelContainer}><Text style={styles.labelText}>Upload Document</Text><InfoTooltip text="Upload a document to translate." /></View>
                <TouchableOpacity style={[styles.uploadBox, isFileDisabled && styles.disabled]} onPress={handleFilePick} disabled={isFileDisabled}>
                    <Text>{uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name).join(', ') : "Upload your document"}</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.orDivider}>OR</Text>

            <Controller
                control={control} name="translateText"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={[styles.inputBase, styles.textarea, isTextDisabled && styles.disabled]} multiline numberOfLines={5} placeholder="Paste your text here..." onChangeText={onChange} onBlur={onBlur} value={value} editable={!isTextDisabled} />
                )}
            />

            <TouchableOpacity style={[styles.submitButton, (!isSubmitEnabled || loading) && styles.disabled]} onPress={handleSubmit(onSubmit)} disabled={!isSubmitEnabled || loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Generate Translation</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    pageWrapper: { padding: 20, flexGrow: 1, backgroundColor: '#f8faff' },
    header: { marginBottom: 24 },
    titleContainer: { flexDirection: 'row' },
    titlePart1: { color: theme.colors.primary, fontSize: 32, fontWeight: '700' },
    titlePart2: { color: '#2a2a2a', fontSize: 32, fontWeight: '500' },
    fieldWrapper: { marginBottom: 10 },
    labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    labelText: { fontSize: 16, fontWeight: '700' },
    inputBase: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 16, minHeight: 52, justifyContent: 'center' },
    textarea: { height: 140, textAlignVertical: 'top', paddingTop: 16 },
    uploadBox: { backgroundColor: '#f6f5ff', minHeight: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    disabled: { backgroundColor: '#f0f0f0', opacity: 0.7 },
    orDivider: { textAlign: 'center', marginVertical: 16, fontWeight: '600', color: '#444' },
    submitButton: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: 'white', fontWeight: 'bold' },
    inputError: { borderColor: 'red' },
});

export default TextTranslator;