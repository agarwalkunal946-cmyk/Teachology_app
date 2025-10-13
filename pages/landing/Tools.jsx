import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { theme } from '../../styles/theme';

const toolCategories = ["Plan", "Learn", "Prepare", "Success"];
const toolsData = [
    { category: "Plan", title: "Create AI-Generated Quizzes", imgSrc: require('../../assets/img/ui/rubric.png'), description: "Automatically create quizzes from books, PDFs, or online content." },
    { category: "Learn", title: "Chat with Books & Documents", imgSrc: require('../../assets/img/ui/chat_robot.webp'), description: "Interact with your study materials like a personal tutor." },
    { category: "Prepare", title: "Instant Flashcard Generation", imgSrc: require('../../assets/img/ui/summarize.png'), description: "Turn your notes or any text into a set of flashcards in seconds." },
    { category: "Success", title: "Personalized Study Plans", imgSrc: require('../../assets/img/ui/study_plan.jpg'), description: "Get a customized study plan based on your goals and learning materials." },
];

const ToolCard = ({ tool }) => (
    <View style={styles.toolCard}>
        <Image source={tool.imgSrc} style={styles.toolCardImg} />
        <View style={styles.toolCardContent}>
            <View style={styles.categoryBadge}><Text style={styles.toolCardCategory}>{tool.category}</Text></View>
            <Text style={styles.toolCardTitle}>{tool.title}</Text>
            <Text style={styles.toolCardDescription}>{tool.description}</Text>
        </View>
    </View>
);

const Tools = () => {
    const [activeTab, setActiveTab] = useState(toolCategories[0]);
    const filteredTools = toolsData.filter(tool => tool.category === activeTab);

    return (
        <View style={styles.toolsSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>AI Teaching Tools</Text>
                <Text style={styles.sectionSubtitle}>Revolutionize your classroom with smart AI tools designed to simplify planning and personalize learning.</Text>
            </View>
            <View style={styles.toolTabs}>
                {toolCategories.map(category => (
                    <TouchableOpacity key={category} style={[styles.tabBtn, activeTab === category && styles.activeTab]} onPress={() => setActiveTab(category)}>
                        <Text style={[styles.tabText, activeTab === category && styles.activeTabText]}>{category}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={filteredTools}
                renderItem={({ item }) => <ToolCard tool={item} />}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.toolCardsGrid}
                numColumns={2}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    toolsSection: { padding: 20 },
    sectionHeader: { alignItems: 'center', marginBottom: 24 },
    sectionTitle: { fontSize: 28, fontWeight: '700' },
    sectionSubtitle: { textAlign: 'center', color: '#666', marginTop: 8, lineHeight: 24, paddingHorizontal: 10 },
    toolTabs: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
    tabBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, borderWidth: 2, borderColor: theme.colors.primary, backgroundColor: 'transparent' },
    activeTab: { backgroundColor: theme.colors.primary },
    tabText: { color: theme.colors.primary, fontWeight: '600' },
    activeTabText: { color: 'white' },
    toolCardsGrid: { alignItems: 'center' },
    toolCard: { width: '48%', backgroundColor: '#f3f2f9', borderRadius: 30, padding: 16, margin: '1%', gap: 16 },
    toolCardImg: { width: '100%', borderRadius: 20, aspectRatio: 16 / 9 },
    toolCardContent: { gap: 12 },
    categoryBadge: { backgroundColor: '#deddff', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start' },
    toolCardCategory: { color: theme.colors.primary, fontWeight: '500' },
    toolCardTitle: { fontSize: 20, fontWeight: '700' },
    toolCardDescription: { fontSize: 16, lineHeight: 22 },
});

export default Tools;