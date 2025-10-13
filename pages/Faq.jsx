import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    LayoutAnimation, 
    ActivityIndicator, 
    ScrollView,
    Platform,
    UIManager
} from 'react-native';
import api from "../utils/apiLogger"; // Asegúrate de que la ruta sea correcta
import { SiteContentEndpoint, apiUrl } from "../config/config"; // Asegúrate de que la ruta sea correcta
import { ChevronDown } from 'lucide-react-native';

// Habilitar LayoutAnimation para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Simulación de un objeto de tema
const theme = {
    colors: {
        primary: '#443FE1',
        textPrimary: '#333',
        textDark: '#2a2a2a',
        textLight: '#5a5a5a',
    }
};

const FaqItem = ({ faq, isOpen, onClick }) => {
    return (
        <View style={styles.faqItem}>
            <TouchableOpacity style={styles.faqQuestion} onPress={onClick} activeOpacity={0.7}>
                <Text style={styles.questionText}>{faq.question}</Text>
                <ChevronDown 
                    color={theme.colors.textPrimary} 
                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }} 
                />
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.answerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
            )}
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
                // Suponiendo que la respuesta es un array de objetos con `type` y `body`
                const faqDocs = response.data
                    .filter(item => item.type === "faqs-content")
                    .map(doc => JSON.parse(doc.body));
                
                // Ordenar por la propiedad 'order'
                setFaqData(faqDocs.sort((a, b) => a.order - b.order));
            } catch (error) {
                console.error("Failed to fetch FAQs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const handleToggle = (index) => {
        // Configura una animación suave para la transición
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <ScrollView contentContainerStyle={styles.faqSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }}/>
            ) : (
                faqData.map((faq, index) => (
                    <FaqItem 
                        key={faq.order || index} 
                        faq={faq} 
                        isOpen={openIndex === index} 
                        onClick={() => handleToggle(index)} 
                    />
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    faqSection: { 
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    sectionHeader: { 
        marginBottom: 24, 
        alignItems: 'center' 
    },
    sectionTitle: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: theme.colors.textDark, 
        textAlign: 'center' 
    },
    faqItem: { 
        borderBottomWidth: 1, 
        borderColor: '#e9ecef' 
    },
    faqQuestion: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 20,
    },
    questionText: { 
        fontSize: 17, 
        fontWeight: '600', 
        color: theme.colors.textDark, 
        flex: 1, // Permite que el texto ocupe el espacio disponible
        marginRight: 10, // Espacio para el icono
    },
    answerContainer: {
        paddingBottom: 20,
    },
    faqAnswer: { 
        fontSize: 15, 
        color: theme.colors.textLight, 
        lineHeight: 24 
    },
});

export default FAQ;