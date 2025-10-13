import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import { theme } from '../styles/theme';

const skillsData = [
  { name: 'HTML', value: 0.9, description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem.' },
  { name: 'CSS', value: 0.95, description: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur.' },
  { name: 'JavaScript', value: 0.8, description: 'Neque porro quisquam est qui dolorem ipsum quia dolor.' },
  { name: 'Photoshop', value: 0.55, description: 'Quis autem vel eum iure reprehenderit qui in ea voluptate.' },
];

const Skills = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {skillsData.map((skill, index) => (
        <View key={index} style={styles.skillBox}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text style={styles.skillDescription}>{skill.description}</Text>
          <Text style={styles.skillPercentage}>{`${Math.round(skill.value * 100)}%`}</Text>
          <Progress.Bar
            progress={skill.value}
            width={null}
            height={8}
            color={theme.colors.primary}
            unfilledColor="#e9ecef"
            borderWidth={0}
            style={styles.progressBar}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8faff',
  },
  skillBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  skillName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  skillDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginVertical: 8,
  },
  skillPercentage: {
    alignSelf: 'flex-end',
    fontWeight: '600',
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  progressBar: {
    borderRadius: 4,
  },
});

export default Skills;