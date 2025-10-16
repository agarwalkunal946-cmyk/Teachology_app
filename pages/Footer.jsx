import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

function Footer() {
  const auth = useSelector((state) => state.auth);

  if (!auth.user) {
    return (
      <View style={styles.footer}>
        <Text style={styles.footerCopyright}>
          Copyright © Teachology AI 2025. All rights reserved.
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#443fe1",
    paddingVertical: 25,
    paddingHorizontal: "5%",
    width: "100%",
  },
  footerCopyright: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
  },
});

export default Footer;