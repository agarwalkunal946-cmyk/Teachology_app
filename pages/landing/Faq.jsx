import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, ActivityIndicator } from 'react-native';
import api from "../../utils/apiLogger";
import { SiteContentEndpoint, apiUrl } from "../../config/config";
import { ChevronDown } from 'lucide-react-native';
import { theme } from '../../styles/theme';

const FaqItem = ({ faq, isOpen, onClick }) => {
    return (
        <View style={styles.faqItem}>
            <TouchableOpacity style={styles.faqQuestion} onPress={onClick}>
                <Text style={styles.questionText}>{faq.question}</Text>
                <View style={styles.faqIconContainer}>
                    <ChevronDown color={theme.colors.primary} style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }} />
                </View>
            </TouchableOpacity>
            {isOpen && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
        </View>
    );
};

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [faqData, setFaqData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await api.post(`${apiUrl}${SiteContentEndpoint}`);
                const faqDocs = response.data
                    .filter(item => item.type === "faqs-content")
                    .map(doc => JSON.parse(doc.body))
                    .sort((a, b) => a.order - b.order);
                setFaqData(faqDocs);
            } catch (error) {
                console.error("Failed to fetch FAQs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const handleToggle = (index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <View style={styles.faqSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                <Text style={styles.sectionSubtitle}>Get answers to common questions about our AI tools and platform.</Text>
            </View>
            {loading ? <ActivityIndicator size="large" color={theme.colors.primary} /> :
                faqData.map((faq, index) => (
                    <FaqItem key={faq.order || index} faq={faq} isOpen={openIndex === index} onClick={() => handleToggle(index)} />
                ))
            }
        </View>
    );
};

const styles = StyleSheet.create({
    faqSection: { padding: 20, marginVertical: 15 },
    sectionHeader: { marginBottom: 24, paddingHorizontal: 10 },
    sectionTitle: { fontSize: 28, fontWeight: '700', color: theme.colors.textDark, textAlign: 'center' },
    sectionSubtitle: { fontSize: 16, color: theme.colors.textLight, textAlign: 'center', marginTop: 8, lineHeight: 24 },
    faqItem: { backgroundColor: '#f3f2f9', borderRadius: 24, padding: 20, marginBottom: 16 },
    faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    questionText: { fontSize: 18, fontWeight: '700', color: theme.colors.textDark, flex: 1 },
    faqIconContainer: { backgroundColor: '#deddff', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    faqAnswer: { paddingTop: 16, fontSize: 16, color: theme.colors.textDark, lineHeight: 24 },
});

export default FAQ;