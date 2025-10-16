import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from "react-native";

const toolCategories = ["Plan", "Learn", "Prepare", "Success"];

const toolsData = [
  { category: "Plan", title: "Create AI-Generated Quizzes & Assessments", description: "Automatically create quizzes from books, PDFs, or online content. Reinforce learning with custom practice tests.", imgSrc: require("../../assets/img/hero/quiz.png") },
  { category: "Learn", title: "Chat with Books & Documents", description: "Interact with your study materials like a personal tutor. Ask questions and get instant explanations.", imgSrc: require("../../assets/img/hero/chatbook.png") },
  { category: "Prepare", title: "Instant Flashcard Generation", description: "Turn your notes, chapters, or any text into a set of flashcards in seconds to supercharge your study sessions.", imgSrc: require("../../assets/img/hero/instant_flashcard.png") },
  { category: "Success", title: "Personalized Study Plans", description: "Get a customized study plan based on your goals and learning materials to stay on track and achieve success.", imgSrc: require("../../assets/img/hero/personalized.png") },
  { category: "Plan", title: "AI-Powered Lesson Planning", description: "For teachers: generate comprehensive lesson plans tailored to your curriculum in a fraction of the time.", imgSrc: require("../../assets/img/hero/lesson.png") },
  { category: "Learn", title: "Summarize Complex Topics", description: "Get concise summaries of long documents or complex subjects to quickly grasp key concepts.", imgSrc: require("../../assets/img/hero/summarize.png") },
  { category: "Prepare", title: "Practice with AI Tutors", description: "Engage in conversational practice sessions with an AI tutor that can adapt to your learning pace.", imgSrc: require("../../assets/img/hero/ai_tutor.png") },
  { category: "Success", title: "Track Your Progress", description: "Monitor your learning journey with detailed analytics on your quiz scores and study habits.", imgSrc: require("../../assets/img/hero/track.png") },
];

const ToolCard = ({ tool }) => (
  <View style={styles.toolCard}>
    <Image source={tool.imgSrc} style={styles.toolCardImg} resizeMode="cover" />
    <View style={styles.toolCardContent}>
      <Text style={styles.toolCardCategory}>{tool.category}</Text>
      <Text style={styles.toolCardTitle}>{tool.title}</Text>
      <Text style={styles.toolCardDescription}>{tool.description}</Text>
    </View>
  </View>
);

const Tools = () => {
  const [activeTab, setActiveTab] = useState(toolCategories[0]);
  const filteredTools = toolsData.filter((tool) => tool.category === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.toolsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Teaching Tools</Text>
          <Text style={styles.sectionSubtitle}>
            Revolutionize your classroom with smart AI teaching tools designed to simplify lesson planning, automate assessments, and personalize student learning.
          </Text>
        </View>
        <View style={styles.toolTabs}>
          {toolCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.tabBtn, activeTab === category && styles.activeTab]}
              onPress={() => setActiveTab(category)}
            >
              <Text style={[styles.tabBtnText, activeTab === category && styles.activeTabText]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.toolCardsGrid}>
          {filteredTools.map((tool, index) => (
            <ToolCard key={index} tool={tool} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  toolsSection: {
    padding: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  toolTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 50,
  },
  activeTab: {
    backgroundColor: '#443fe1',
    shadowColor: '#443fe1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  activeTabText: {
    color: '#ffffff',
  },
  toolCardsGrid: {
    gap: 20,
  },
  toolCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  toolCardImg: {
    width: '100%',
    height: 180,
  },
  toolCardContent: {
    padding: 16,
  },
  toolCardCategory: {
    color: '#443fe1',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  toolCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 26,
  },
  toolCardDescription: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
});

export default Tools;