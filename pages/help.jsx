import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, LayoutAnimation, Platform, UIManager, Linking } from "react-native";
import FontAwesome from 'react-native-vector-icons/FontAwesome';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqData = [
  { question: "¿Qué es esta plataforma y cómo funciona?", answer: "Nuestra herramienta educativa impulsada por IA ayuda a estudiantes y profesores generando cuestionarios, evaluaciones, resúmenes y planes de lecciones. ¡Simplemente sube un documento, selecciona un tema o chatea con tu material de estudio, y la IA te ayudará al instante!" },
  { question: "¿Quién puede usar esta plataforma?", answer: "Estudiantes, profesores e instituciones educativas pueden usar nuestra plataforma. Ya sea que necesites ayuda para estudiar, crear evaluaciones o planificar lecciones, nuestra IA está diseñada para apoyar tus necesidades de aprendizaje y enseñanza." },
  { question: "¿Pueden los estudiantes generar cuestionarios sobre cualquier tema?", answer: "¡Sí! Los estudiantes pueden crear cuestionarios y evaluaciones directamente desde el contenido del PDF o libro de texto subido. Nuestra IA genera preguntas basadas únicamente en el documento proporcionado." },
  { question: "¿Es esta plataforma útil para los profesores?", answer: "¡Absolutamente! Los profesores pueden crear planes de lecciones estructurados, generar y descargar evaluaciones, y obtener asistencia impulsada por IA en la preparación de materiales para el aula." },
  { question: "¿Qué planes de precios están disponibles?", answer: "Ofrecemos un Plan Gratuito con funciones limitadas, planes Estudiante Pro y Profesor Pro para herramientas de aprendizaje y enseñanza mejoradas, y un Plan Institucional Personalizado para escuelas y centros de tutoría." },
  { question: "¿Cómo es de segura mi información?", answer: "Nos tomamos la seguridad de los datos muy en serio. Tus documentos y materiales de estudio subidos no se comparten con terceros." },
  { question: "ContactSupport", answer: "Si encuentras algún problema, puedes contactar fácilmente a nuestro equipo de soporte." },
];


const FaqItem = ({ faq, isOpen, onClick, navigation }) => {
  const isContactItem = faq.question === "ContactSupport";
  const answerContent = isContactItem ? (
    <Text>
      Si encuentras algún problema, puedes contactar fácilmente a nuestro equipo de soporte haciendo clic en el enlace de{' '}
      <Text style={styles.linkStyle} onPress={() => navigation.navigate('Contact')}>
        contacto
      </Text>
      .
    </Text>
  ) : (
    faq.answer
  );

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqQuestion} onPress={onClick} activeOpacity={0.7}>
        <Text style={styles.questionText}>{isContactItem ? '¿Cómo puedo obtener soporte si tengo problemas?' : faq.question}</Text>
        <View style={[styles.faqIconWrapper, isOpen && styles.iconOpen]}>
          <FontAwesome name="chevron-down" size={16} color="#443fe1" />
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.faqAnswer}>
          <Text style={styles.answerText}>{answerContent}</Text>
        </View>
      )}
    </View>
  );
};

const Help = ({ navigation }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          <Text style={styles.highlight}>Preguntas</Text> Frecuentes
        </Text>
        <Text style={styles.sectionSubtitle}>
          Obtén respuestas a preguntas comunes sobre nuestros cursos de IA y cómo podemos ayudarte a dominar el mundo de la Inteligencia Artificial.
        </Text>
      </View>
      <View style={styles.faqList}>
        {faqData.map((faq, index) => (
          <FaqItem
            key={index}
            faq={faq}
            isOpen={index === openIndex}
            onClick={() => handleToggle(index)}
            navigation={navigation}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff' },
    sectionHeader: { marginBottom: 40, alignItems: 'center' },
    sectionTitle: { fontSize: 32, fontWeight: '700', textAlign: 'center', lineHeight: 40, color: '#242424' },
    highlight: { color: '#443fe1' },
    sectionSubtitle: { fontSize: 16, maxWidth: 600, lineHeight: 24, textAlign: 'center', color: '#5d5d5d', marginTop: 16 },
    faqList: { gap: 16, maxWidth: 900, alignSelf: 'center' },
    faqItem: { backgroundColor: '#f3f2f9', borderRadius: 24, padding: 8 },
    faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    questionText: { fontSize: 18, fontWeight: '700', color: '#242424', flex: 1, marginRight: 12 },
    faqIconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e6e6ff', justifyContent: 'center', alignItems: 'center' },
    iconOpen: { transform: [{ rotate: '180deg' }] },
    faqAnswer: { paddingHorizontal: 16, paddingBottom: 16 },
    answerText: { fontSize: 16, lineHeight: 24, color: '#3d3d3d' },
    linkStyle: { color: '#443fe1', textDecorationLine: 'underline', fontWeight: '600' },
});

export default Help;