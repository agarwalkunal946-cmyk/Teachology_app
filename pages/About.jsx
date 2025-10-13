import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { theme } from '../styles/theme';

const About = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>About Me</Text>
            <Text style={styles.subtitle}>UI/UX Designer & Web Developer</Text>
            <View style={styles.imageContainer}>
                <Image source={require('../assets/img/profile/profile-square-2.webp')} style={styles.profileImage} />
            </View>
            <Text style={styles.paragraph}>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </Text>
            <View style={styles.infoGrid}>
                <InfoItem label="Name" value="Eliot Johnson" />
                <InfoItem label="Phone" value="+123 456 7890" />
                <InfoItem label="Age" value="26 Years" />
                <InfoItem label="Email" value="email@example.com" />
                <InfoItem label="Occupation" value="Lorem Engineer" />
                <InfoItem label="Nationality" value="Ipsum" />
            </View>
        </ScrollView>
    );
};

const InfoItem = ({ label, value }) => (
    <View style={styles.infoItem}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center', backgroundColor: '#f8faff' },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 8 },
    subtitle: { fontSize: 16, color: theme.colors.textLight, textAlign: 'center', marginBottom: 20 },
    imageContainer: { borderRadius: 16, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    profileImage: { width: 250, height: 250 },
    paragraph: { fontSize: 16, color: theme.colors.textLight, textAlign: 'center', lineHeight: 24, marginVertical: 20 },
    infoGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    infoItem: { width: '48%', marginBottom: 15 },
    label: { fontWeight: 'bold', color: theme.colors.textDark, fontSize: 16 },
    value: { color: theme.colors.textLight, fontSize: 16, marginTop: 4 },
});

export default About;