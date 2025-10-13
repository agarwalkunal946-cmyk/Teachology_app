import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const workExperience = [
  { company: 'Etiam Industries', period: 'Jun, 2023 - Current', position: 'Project Lead', description: 'Quia nobis sequi est occaecati aut. Repudiandae et iusto quae reiciendis et quis Eius vel ratione eius unde vitae rerum voluptates asperiores voluptatem.' },
  { company: 'Nullam Corp', period: '2019 - 2023', position: 'Senior Graphic Design Specialist', points: ['Lead in the design, development, and implementation.', 'Delegate tasks to the 7 members of the design team.', 'Supervise the assessment of all graphic materials.'] },
];

const education = [
  { institution: 'Vestibulum University', period: '2017-2019', degree: 'Diploma in Consequat', description: 'Curabitur ullamcorper ultricies nisi nam eget dui etiam rhoncus maecenas tempus.' },
  { institution: 'Nullam Corp', period: '2019 - 2023', degree: 'Master of Fine Arts & Graphic Design', description: 'Curabitur ullamcorper ultricies nisi nam eget dui etiam rhoncus maecenas tempus.' },
];

const TimelineItem = ({ item }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <Text style={styles.company}>{item.company || item.institution}</Text>
      <Text style={styles.period}>{item.period}</Text>
    </View>
    <View style={styles.timelineDotContainer}>
      <View style={styles.timelineDot} />
      <View style={styles.timelineLine} />
    </View>
    <View style={styles.timelineRight}>
      <Text style={styles.position}>{item.position || item.degree}</Text>
      <Text style={styles.description}>{item.description}</Text>
      {item.points && item.points.map((point, i) => <Text key={i} style={styles.bulletPoint}>• {point}</Text>)}
    </View>
  </View>
);

const Resume = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mainTitle}>Resume</Text>
      
      <View style={styles.resumeBlock}>
        <Text style={styles.blockTitle}>Work Experience</Text>
        {workExperience.map((item, index) => <TimelineItem key={index} item={item} />)}
      </View>
      
      <View style={styles.resumeBlock}>
        <Text style={styles.blockTitle}>My Education</Text>
        {education.map((item, index) => <TimelineItem key={index} item={item} />)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  mainTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  resumeBlock: { marginBottom: 30 },
  blockTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: theme.colors.primary, paddingBottom: 5 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { width: 100, alignItems: 'flex-end', paddingRight: 10 },
  timelineDotContainer: { alignItems: 'center', width: 20 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary, zIndex: 1 },
  timelineLine: { position: 'absolute', top: 12, bottom: -20, width: 2, backgroundColor: '#e0e0e0' },
  timelineRight: { flex: 1, paddingLeft: 10 },
  company: { fontWeight: 'bold', textAlign: 'right' },
  period: { fontSize: 12, color: '#666', textAlign: 'right' },
  position: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  description: { fontSize: 14, color: '#555', lineHeight: 20 },
  bulletPoint: { fontSize: 14, color: '#555', marginTop: 5, marginLeft: 10 },
});

export default Resume;