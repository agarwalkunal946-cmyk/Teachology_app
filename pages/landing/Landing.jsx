import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import Hero from "./Hero";
import Tools from "./Tools";
import Pricing from "./Pricing";
import FAQ from "./Faq";
import Newsletter from "./Newsletter";
import { SafeAreaView } from 'react-native-safe-area-context';

function Landing() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.homePage}>
        <Hero />
        <Tools />
        <Pricing />
        <FAQ />
        <Newsletter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  homePage: {
    flex: 1,
  },
});

export default Landing;