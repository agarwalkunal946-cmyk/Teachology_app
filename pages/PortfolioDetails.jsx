import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import portfolioData from '../data/portfolioData';
import BackButton from '../components/BackButton';

const PortfolioDetails = () => {
    const route = useRoute();
    const { id } = route.params;
    const portfolioItem = portfolioData.find(item => item.id === id);

    if (!portfolioItem) {
        return (
            <View style={styles.container}>
                <Text>Portfolio Item Not Found</Text>
                <BackButton />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <BackButton />
            <Image source={{ uri: portfolioItem.image }} style={styles.image} />
            <Text style={styles.title}>{portfolioItem.title}</Text>
            <Text style={styles.details}>{portfolioItem.details}</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    image: { width: '100%', height: 250, borderRadius: 8, marginVertical: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    details: { fontSize: 16, lineHeight: 24 },
});

export default PortfolioDetails;