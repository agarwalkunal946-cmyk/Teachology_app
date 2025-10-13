import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Hero = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.heroSection}>
      <View style={styles.heroContent}>
        <View style={styles.heroText}>
          <Text style={styles.subHeadline}>
            Revolutionizing Education with AI
          </Text>
          <Text style={styles.heroHeadline}>
            Learn Smarter, Teach Better!
          </Text>
          <Text style={styles.heroDescription}>
            Meet Simplify Teaching — your AI-powered assistant to save time and
            elevate learning. From lesson plans to exam prep and assessments, our
            smart tool makes studying and teaching effortless.
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton} 
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.exploreButtonText}>Explore Our Tools</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroImageWrapper}>
          <Image
            source={require("../../assets/img/teachology/hero.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    padding: 20,
    backgroundColor: '#f0f4ff',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroText: {
    alignItems: 'center',
    marginBottom: 30,
  },
  subHeadline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#443fe1',
    marginBottom: 8,
  },
  heroHeadline: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#443fe1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroImageWrapper: {
    width: '100%',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
});

export default Hero;
