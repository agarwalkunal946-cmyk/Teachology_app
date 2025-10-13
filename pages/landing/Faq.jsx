import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, LayoutAnimation, Platform, UIManager } from "react-native";
import api from "../../utils/apiLogger";
import { SiteContentEndpoint } from "../../config/config";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FaqItem = ({ faq, isOpen, onClick }) => {
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqQuestion} onPress={onClick}>
        <Text style={styles.faqQuestionText}>{faq.question}</Text>
        <Text style={styles.faqIcon}>{isOpen ? "−" : "+"}</Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.faqAnswerContent}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.VITE_APP_API_BASE_URL;

  const handleToggle = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.post(`${apiUrl}${SiteContentEndpoint}`);
        const faqDocs = response.data.filter((item) => item.type === "faqs-content");
        if (faqDocs.length > 0) {
          const parsedFaqs = faqDocs.map((doc) => JSON.parse(doc.body));
          parsedFaqs.sort((a, b) => a.order - b.order);
          setFaqData(parsedFaqs);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [apiUrl]);

  return (
    <View style={styles.faqContainer}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqTitle}>
          <Text style={styles.titlePart1}>Frequently Asked </Text>
          <Text style={styles.titlePart2}>Questions</Text>
        </Text>
        <Text style={styles.faqSubtitle}>
          Get answers to common questions about our AI courses, learning paths, and how we can help you master the world of Artificial Intelligence.
        </Text>
      </View>
      <View style={styles.faqAccordion}>
        {loading ? (
          <ActivityIndicator size="large" color="#443fe1" />
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  faqContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  faqHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  faqTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titlePart1: {
    color: '#443fe1',
  },
  titlePart2: {
    color: '#1a1a1a',
  },
  faqSubtitle: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginTop: 8,
  },
  faqAccordion: {
    gap: 12,
  },
  faqItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  faqIcon: {
    fontSize: 24,
    fontWeight: '300',
    color: '#443fe1',
  },
  faqAnswerContent: {
    padding: 16,
    backgroundColor: 'white',
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
});

export default FAQ;