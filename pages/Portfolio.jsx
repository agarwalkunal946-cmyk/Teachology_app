import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import portfolioData from '../data/portfolioData';
import { theme } from '../styles/theme';

const categories = ["Plan", "Learn", "Prepare", "Success"];

const Portfolio = () => {
    const [filterKey, setFilterKey] = useState("*");
    const filteredData = filterKey === "*" ? portfolioData : portfolioData.filter(item => item.mainCategory.toLowerCase() === filterKey);

    const PortfolioCard = ({ item }) => (
        <View style={styles.portfolioCard}>
            <Image source={{ uri: item.image }} style={styles.portfolioImage} />
            <View style={styles.portfolioContent}>
                <Text style={styles.category}>{item.mainCategory}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>AI Teaching Tools</Text>
                <Text style={styles.sectionSubtitle}>Supercharge Learning & Teaching with These AI Features.</Text>
            </View>
            <View style={styles.filtersContainer}>
                {categories.map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setFilterKey(cat.toLowerCase())}>
                        <Text style={[styles.filterText, filterKey === cat.toLowerCase() && styles.activeFilter]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={filteredData}
                renderItem={({ item }) => <PortfolioCard item={item} />}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f8f9fe' },
  sectionTitleContainer: { alignItems: 'center', marginVertical: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold' },
  sectionSubtitle: { color: '#666', textAlign: 'center', marginTop: 5 },
  filtersContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  filterText: { fontSize: 16, padding: 10 },
  activeFilter: { color: theme.colors.primary, fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
  portfolioCard: { flex: 1, margin: 5, backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', elevation: 2 },
  portfolioImage: { width: '100%', height: 150 },
  portfolioContent: { padding: 10 },
  category: { color: theme.colors.primary, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: 'bold', marginVertical: 5 },
  description: { fontSize: 12, color: '#666' },
});

export default Portfolio;