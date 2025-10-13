import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../styles/theme';

const ScreenLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 98) {
          clearInterval(timer);
          return 98;
        }
        const increment = prevProgress < 90 ? 1 : 0.1;
        return Math.min(prevProgress + increment, 98);
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.loaderOverlay}>
      <View style={styles.loaderContainer}>
        <Svg height="120" width="120" viewBox="0 0 120 120">
          <Circle
            stroke={theme.colors.solidLightBg}
            fill="transparent"
            strokeWidth="8"
            r={radius}
            cx="60"
            cy="60"
          />
          <Circle
            stroke={theme.colors.primary}
            fill="transparent"
            strokeWidth="8"
            r={radius}
            cx="60"
            cy="60"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.loaderPercentage}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderPercentage: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textDark,
  },
});

export default ScreenLoader;