import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../styles/theme';

const PercentageLoader = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 10));
    }, 150);

    const finishTimeout = setTimeout(() => {
      if (onLoaded) {
        onLoaded();
      }
    }, 1800);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimeout);
    };
  }, [onLoaded]);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.paper}>
        <View style={styles.progressContainer}>
            <Svg height="110" width="110" viewBox="0 0 120 120">
              <Circle stroke="#e0e0e0" fill="transparent" strokeWidth="8" r={radius} cx="60" cy="60" />
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
            <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>{`${Math.round(progress)}%`}</Text>
            </View>
        </View>
        <Text style={styles.loadingText}>Loading Your Plan...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
  },
  paper: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressTextContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
});

export default PercentageLoader;