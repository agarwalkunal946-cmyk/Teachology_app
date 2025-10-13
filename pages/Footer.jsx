import React from "react";
import { View, Text, StyleSheet } from "react-native";

function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContainer}>
        <Text style={styles.footerCopyright}>
          Copyright © Teachology AI 2025. Todos los derechos reservados.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#443FE1',
    paddingVertical: 25,
    paddingHorizontal: '5%',
    width: '100%',
    marginTop: 10,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 1400,
    marginHorizontal: 'auto',
  },
  footerCopyright: {
    margin: 0,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});

export default Footer;