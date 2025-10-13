import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { theme } from '../../styles/theme';

const Hero = () => {
    const navigation = useNavigation();
    return (
        <ImageBackground source={require('../../assets/img/hero/hero.png')} style={styles.heroSection} resizeMode="cover">
            <View style={styles.heroContent}>
                <View style={styles.heroText}>
                    <Text style={styles.subHeadline}>Revolutionizing Education with AI</Text>
                    <Text style={styles.heroHeadline}>Learn Smarter, Teach Better!</Text>
                    <Text style={styles.heroDescription}>Meet Simplify Teaching — your AI-powered assistant to save time and elevate learning.</Text>
                    <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.exploreButtonText}>Explore Our Tools</Text>
                    </TouchableOpacity>
                </View>
                <Image source={require('../../assets/img/hero/hero.png')} style={styles.heroImage} resizeMode="contain" />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    heroSection: { minHeight: 500, justifyContent: 'center', padding: 20 },
    heroContent: { alignItems: 'center' },
    heroText: { alignItems: 'center', marginBottom: 32 },
    subHeadline: { fontSize: 20, fontWeight: '500', color: theme.colors.textDark },
    heroHeadline: { fontWeight: '800', lineHeight: 50, color: theme.colors.primary, fontSize: 40, textAlign: 'center', marginVertical: 8 },
    heroDescription: { fontSize: 16, fontWeight: '400', textAlign: 'center', marginBottom: 24, lineHeight: 24, color: theme.colors.textDark, paddingHorizontal: 10 },
    exploreButton: { backgroundColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30 },
    exploreButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    heroImage: { width: '90%', height: 250 },
});

export default Hero;