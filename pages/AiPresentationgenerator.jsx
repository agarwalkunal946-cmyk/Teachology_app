import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, Alert, Dimensions } from 'react-native';
import ViewPager from 'react-native-pager-view';
import { RefreshCw, Download, ArrowLeft, ArrowRight, Edit2, Check, X } from 'lucide-react-native';
import RNPickerSelect from 'react-native-picker-select';
import { apiUrl, generatePresentationEndpoint } from "../../config/config";
import api from "../../utils/apiLogger";
import { theme } from '../../styles/theme';
import InfoTooltip from "../../components/InfoTooltip";
import TryWithExampleButton from "../../components/TryWithExampleButton";
import tooltips from "../../data/fieldTooltips.json";

const SlideCard = ({ slide, index, totalSlides, onContentChange }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(slide.title || "");
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editedContent, setEditedContent] = useState((slide.content || []).join('\n'));

    const handleSaveContent = () => {
        onContentChange(index, editedContent.split('\n'));
        setIsEditingContent(false);
    };

    return (
        <View style={styles.slideCard}>
            <View style={styles.slideHeader}>
                <Text style={styles.slideTitle}>{editedTitle}</Text>
                <TouchableOpacity onPress={() => setIsEditingContent(true)}><Edit2 size={18} color={theme.colors.primary} /></TouchableOpacity>
            </View>
            <ScrollView>
                {(slide.content || []).map((point, i) => <Text key={i} style={styles.slideContent}>• {point}</Text>)}
            </ScrollView>
            <Text style={styles.slideFooter}>SLIDE {index + 1} / {totalSlides}</Text>
            
            <Modal visible={isEditingContent} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Content</Text>
                        <TextInput
                            style={styles.modalInput}
                            multiline
                            value={editedContent}
                            onChangeText={setEditedContent}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setIsEditingContent(false)}><X color="red" /></TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveContent}><Check color="green" /></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const AIPresentationGenerator = () => {
    const [topic, setTopic] = useState("");
    const [slideCount, setSlideCount] = useState("7");
    const [audience, setAudience] = useState("A general audience");
    const [generatedSlides, setGeneratedSlides] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const pagerRef = useRef(null);

    const handleGenerate = async () => {
        if (!topic.trim()) { Alert.alert("Input required", "Please enter a presentation topic."); return; }
        setLoading(true);
        setError(null);
        setGeneratedSlides(null);
        try {
            const response = await api.post(`${apiUrl}${generatePresentationEndpoint}`, {
                topic,
                slideCount: parseInt(slideCount, 10),
                audience,
            });
            setGeneratedSlides(response.data.slides);
        } catch (err) {
            setError(err.response?.data?.detail || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleDownload = () => {
        Alert.alert("Feature Notice", "PPTX generation is not available on mobile. This feature is web-only.");
    };

    const handleSlideUpdate = (slideIndex, newContent) => {
        setGeneratedSlides(prevSlides => {
            const updatedSlides = [...prevSlides];
            updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], content: newContent };
            return updatedSlides;
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.pageWrapper}>
            <View style={styles.header}>
                <Text style={styles.titlePart1}>AI Presentation <Text style={styles.titlePart2}>Maker</Text></Text>
                <Text style={styles.description}>Create professional presentations with AI.</Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.fieldWrapper}>
                    <Text style={styles.labelText}>Presentation Topic *</Text>
                    <TextInput style={styles.input} value={topic} onChangeText={setTopic} placeholder="e.g., The Future of AI" />
                </View>

                <View style={styles.formRow}>
                    <View style={styles.fieldWrapper}>
                        <Text style={styles.labelText}>Number of Slides</Text>
                         <RNPickerSelect
                            onValueChange={(value) => setSlideCount(value)}
                            items={[3, 5, 7, 10, 12, 15].map(num => ({ label: `${num} Slides`, value: `${num}` }))}
                            style={pickerSelectStyles}
                            value={slideCount}
                        />
                    </View>
                    <View style={styles.fieldWrapper}>
                         <Text style={styles.labelText}>Target Audience</Text>
                         <TextInput style={styles.input} value={audience} onChangeText={setAudience} placeholder="e.g., A general audience" />
                    </View>
                </View>
                
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={styles.submitButton} onPress={handleGenerate} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate Presentation</Text>}
                    </TouchableOpacity>
                     <TouchableOpacity style={styles.downloadButton} onPress={handleDownload} disabled={!generatedSlides}>
                        <Download color="white" size={18} />
                        <Text style={styles.buttonText}>Download PPT</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {generatedSlides && (
                <View style={styles.outputContainer}>
                    <ViewPager style={styles.viewPager} initialPage={0} ref={pagerRef}>
                        {generatedSlides.map((slide, index) => (
                            <View key={index} style={styles.carouselSlide}>
                                <SlideCard 
                                    slide={slide} 
                                    index={index} 
                                    totalSlides={generatedSlides.length}
                                    onContentChange={handleSlideUpdate}
                                    topic={topic}
                                />
                            </View>
                        ))}
                    </ViewPager>
                </View>
            )}
            
            {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    pageWrapper: { padding: 20, flexGrow: 1, backgroundColor: '#f9fafb' },
    header: { alignItems: 'center', marginBottom: 24 },
    titlePart1: { fontSize: 32, fontWeight: '800', color: '#1f2937' },
    titlePart2: { color: theme.colors.primary },
    description: { fontSize: 16, color: '#4b5563', marginTop: 8 },
    formContainer: { backgroundColor: 'white', padding: 20, borderRadius: 16, elevation: 5 },
    formRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    fieldWrapper: { flex: 1, marginBottom: 15 },
    labelText: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    input: { width: '100%', padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, fontSize: 16, backgroundColor: '#f3f4f6' },
    buttonGroup: { flexDirection: 'row', gap: 10, marginTop: 10 },
    submitButton: { flex: 1, backgroundColor: theme.colors.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
    downloadButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10b981', padding: 14, borderRadius: 8 },
    buttonText: { color: 'white', fontWeight: '600' },
    outputContainer: { marginTop: 20 },
    viewPager: { height: 400 },
    carouselSlide: { padding: 5 },
    slideCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 3, borderWidth: 1, borderColor: '#eee' },
    slideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    slideTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, marginBottom: 10 },
    slideContent: { fontSize: 16, marginBottom: 5 },
    slideFooter: { marginTop: 'auto', paddingTop: 10, alignSelf: 'flex-end', color: '#6b7280' },
    errorText: { color: 'red', textAlign: 'center', marginTop: 10 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    modalInput: { height: 150, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: { ...styles.input, height: 50, paddingTop: 0, justifyContent: 'center' },
    inputAndroid: { ...styles.input, height: 50, paddingTop: 0, justifyContent: 'center' },
});

export default AIPresentationGenerator;