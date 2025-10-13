import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Dimensions, SafeAreaView } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

const headingText = "Revolutionizing Education with AI – Learn Smarter, Teach Better!";
const words = headingText.split(' ');
const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;

const AnimatedWord = ({ word, index }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const primaryColor = "#3a86ff";
  const textColor = "#343a40";

  const wordStyle = [
    styles.animatedWord,
    word.toLowerCase() === "learn" && { color: primaryColor, fontWeight: '700' },
    word.toLowerCase() === "teach" && { color: primaryColor, fontWeight: '700' },
  ];

  return (
    <Animated.Text style={[animatedStyle, wordStyle]}>
      {word}{' '}
    </Animated.Text>
  );
};

function Hero() {
  const primaryColor = "#3a86ff";
  const highlightColor = "#fdc500";
  const textColor = "#343a40";
  const mutedTextColor = "#6c757d";

  return (
    <SafeAreaView style={styles.heroSection}>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.column}>
            <View style={styles.headingContainer}>
              {words.map((word, index) => (
                <AnimatedWord key={`${word}-${index}`} word={word} index={index} />
              ))}
            </View>
            <Text style={styles.leadText}>
              Conoce a tu asistente de aprendizaje y enseñanza impulsado por IA, que simplifica la enseñanza y ahorra tiempo. Nuestra herramienta de IA de vanguardia transforma la forma en que los estudiantes estudian y los profesores educan.
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: textColor }]}>50+</Text>
                <Text style={[styles.statLabel, { color: mutedTextColor }]}>Profesores Empoderados</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: textColor }]}>500+</Text>
                <Text style={[styles.statLabel, { color: mutedTextColor }]}>Estudiantes Empoderados</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: textColor }]}>95%</Text>
                <Text style={[styles.statLabel, { color: mutedTextColor }]}>Satisfacción Estudiantil</Text>
              </View>
            </View>
          </View>
          <View style={styles.column}>
            <View style={styles.heroImageContainer}>
              <Image
                source={require("../assets/img/hero/hero.png")}
                style={styles.heroImage}
                resizeMode="contain"
              />
              <View style={[styles.shape1, { backgroundColor: primaryColor }]} />
              <View style={[styles.shape2, { backgroundColor: highlightColor }]} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroSection: { backgroundColor: '#fff', paddingVertical: 40 },
  container: { paddingHorizontal: 20 },
  row: { flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' },
  column: { flex: 1, width: '100%', padding: 10 },
  headingContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  animatedWord: { fontSize: 38, fontWeight: '700', lineHeight: 46, color: '#343a40' },
  leadText: { color: '#343a40', fontSize: 17, lineHeight: 28, marginBottom: 30 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 14, marginTop: 5 },
  heroImageContainer: { position: 'relative', justifyContent: 'center', alignItems: 'center', marginTop: isMobile ? 40 : 0 },
  heroImage: { width: '100%', height: 350, zIndex: 3 },
  shape1: { position: 'absolute', width: 100, height: 100, borderRadius: 20, transform: [{ rotate: '45deg' }], top: 20, left: 20, zIndex: 1 },
  shape2: { position: 'absolute', width: 60, height: 60, borderRadius: 15, transform: [{ rotate: '30deg' }], bottom: 20, right: 20, zIndex: 1 },
});

export default Hero;