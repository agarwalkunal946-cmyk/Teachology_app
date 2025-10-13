import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import Hero from "./Hero";
import Tools from "./Tools";
import Pricing from "./Pricing";
import FAQ from "./Faq";
import Newsletter from "./Newsletter";

function Landing() {
  return (
    <ScrollView style={styles.container}>
      <Hero />
      <Tools />
      <Pricing />
      <FAQ />
      <Newsletter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f2f9',
    },
});

export default Landing;