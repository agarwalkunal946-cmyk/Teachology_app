import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; 

const { width } = Dimensions.get('window');

const Hero = () => {
  const navigation = useNavigation(); 

  const handleExplorePress = () => {
    navigation.navigate('Login'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.heroSection}>
        <View style={styles.heroBackgroundGraphics}>
          <Image
            source={require('../../assets/img/teachology/686fab3f0f9365f3eefa18fb_Rectangle-1.png')}
            style={styles.heroBgShape}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/img/teachology/686fab010b2c2b257cf602fa_Group.png')}
            style={styles.heroBgPattern}
            resizeMode="contain"
          />
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroText}>
            <Text style={styles.heroHeadline}>
              <Text style={styles.subHeadline}>
                Revolutionizing Education with AI{'\n'}
              </Text>
              Learn Smarter, Teach Better!
            </Text>
            <Text style={styles.heroDescription}>
              Meet Simplify Teaching — your AI-powered assistant to save time and
              elevate learning. From lesson plans to exam prep and assessments,
              our smart tool makes studying and teaching effortless.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={handleExplorePress}>
              <Text style={styles.exploreButtonText}>Explore Our Tools</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroImageWrapper}>
            <Image
              source={require('../../assets/img/teachology/hero.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 20
  },
  heroBackgroundGraphics: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroBgShape: {
    position: 'absolute',
    top: -80,
    left: -100,
    width: 300,
    height: 300,
    opacity: 0.08,
  },
  heroBgPattern: {
    position: 'absolute',
    bottom: -80,
    right: -100,
    width: 300,
    height: 300,
    opacity: 0.08,
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  heroText: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroHeadline: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 16,
  },
  subHeadline: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D3748',
    lineHeight: 30,
  },
  heroDescription: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: '95%',
  },
  exploreButton: {
    backgroundColor: '#3182CE',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#3182CE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  heroImageWrapper: {
    width: width * 0.9,
    aspectRatio: 1.2,
    maxWidth: 708,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
});

export default Hero;