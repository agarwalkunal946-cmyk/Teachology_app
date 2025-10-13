import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import * as Progress from "react-native-progress";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { GetDashboardData } from "../config/config";
import api from "../utils/apiLogger";
import { selectUserId } from "../redux/authSlice";

const screenWidth = Dimensions.get("window").width;
const isMobile = screenWidth < 768;

const VIBRANT_COLORS = [
  "#443FE1",
  "#20C997",
  "#FF6B8A",
  "#FFC107",
  "#7B61FF",
  "#007BFF",
];

const theme = {
  primaryBlue: "#443FE1",
  darkText: "#2a2a2a",
  lightText: "#5a5a5a",
  bgLightBlue: "#F0F7FF",
  cardBg: "#FFFFFF",
  progressExcellentColor: "#20C997",
  progressAwesomeColor: "#007BFF",
  progressGrowingColor: "#FFC107",
  progressHurryUpColor: "#FD7E14",
  progressNotStartedColor: "#FF6B8A",
  progressPlanExcellentColor: "#443FE1",
  progressExcellentBg: "rgba(32, 201, 151, 0.1)",
  progressAwesomeBg: "rgba(0, 123, 255, 0.1)",
  progressGrowingBg: "rgba(255, 193, 7, 0.1)",
  progressHurryUpBg: "rgba(253, 126, 20, 0.1)",
  progressNotStartedBg: "rgba(255, 107, 138, 0.1)",
  progressPlanExcellentBg: "rgba(68, 63, 225, 0.1)",
};

const PlaceholderCard = ({ title, message }) => (
  <View style={[styles.dbCardLarge, styles.placeholderCard]}>
    <Text style={styles.dbCardTitle}>{title}</Text>
    <View style={styles.placeholderContent}>
      <Text style={styles.placeholderText}>{message}</Text>
    </View>
  </View>
);

const getStudyPlanStyleAndMessage = (progress) => {
  if (progress === 100) return { color: theme.progressExcellentColor, className: "completed", message: "Completed!" };
  if (progress >= 90) return { color: theme.progressPlanExcellentColor, className: "excellent", message: "Excellent!" };
  if (progress >= 50) return { color: theme.progressAwesomeColor, className: "awesome", message: "Keep Growing!" };
  if (progress >= 10) return { color: theme.progressGrowingColor, className: "growing", message: "Keep Working!" };
  if (progress > 0) return { color: theme.progressHurryUpColor, className: "hurryUp", message: "Hurry Up!" };
  return { color: theme.progressNotStartedColor, className: "notStarted", message: "Not Started" };
};

const StudyPlanOverview = ({ data }) => {
  if (!data || data.length === 0) {
    return <PlaceholderCard title="Study Plan Overview" message="No study plans found. Create a new plan to start your journey!" />;
  }

  return (
    <View style={styles.dbCardLarge}>
      <Text style={styles.dbCardTitle}>Study Plan Overview</Text>
      <View style={styles.studyPlanGrid}>
        {data.map((plan, index) => {
          const styleInfo = getStudyPlanStyleAndMessage(plan.completion_percentage);
          const progress = plan.completion_percentage / 100;
          return (
            <View key={plan._id || index} style={[styles.studyPlanItem, { borderColor: styleInfo.color }]}>
              <Progress.Circle
                size={80}
                progress={progress}
                showsText={true}
                formatText={() => `${plan.completion_percentage}%`}
                color={styleInfo.color}
                unfilledColor="#e0e0e0"
                borderWidth={0}
                thickness={8}
                textStyle={{ fontSize: 18, fontWeight: '700', color: styleInfo.color }}
              />
              <Text style={styles.studyPlanLabel}>{`SAT Plan ${index + 1}`}</Text>
              <View style={[styles.statusBadge, styles[`statusBadge_${styleInfo.className}`]]}>
                <Text style={[styles.statusBadgeText, styles[`statusBadgeText_${styleInfo.className}`]]}>{styleInfo.message}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const OverallPerformance = ({ data }) => {
  const { star_rating = 0, overall_accuracy = 0 } = data?.[0] || {};
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(star_rating);
    const halfStar = star_rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < fullStars; i++) stars.push(<FontAwesome key={`full-${i}`} name="star" style={styles.opStarIcon} />);
    if (halfStar) stars.push(<FontAwesome key="half" name="star-half-empty" style={styles.opStarIcon} />);
    for (let i = 0; i < emptyStars; i++) stars.push(<FontAwesome key={`empty-${i}`} name="star-o" style={styles.opStarIcon} />);
    return stars;
  };

  return (
    <View style={styles.dbCardSmall}>
      <Text style={styles.dbCardTitle}>Overall Performance</Text>
      <View style={styles.opContent}>
        <View style={styles.opStarsContainer}>{renderStars()}</View>
        <Text style={styles.opAccuracy}>{overall_accuracy.toFixed(1)}%</Text>
        <Text style={styles.opAccuracyLabel}>Overall Accuracy</Text>
      </View>
    </View>
  );
};

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const DailyProgress = ({ data }) => (
  <View style={[styles.dbCardLarge, styles.themeCardLightBlue]}>
    <View style={styles.dailyProgressHeader}>
      <Text style={styles.dbCardTitle}>Daily Progress Report</Text>
      <Text style={styles.dailyProgressQuote}>Consistency Beats Intensity!</Text>
    </View>
    <View style={styles.dailyProgressGrid}>
      <View style={styles.metricCard}>
        <View style={[styles.metricIconWrapper, { backgroundColor: "rgba(7, 136, 222, 0.2)" }]}>
          <FontAwesome name="question-circle" size={24} color="#0788DE" />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricTitle}>Total Attempts</Text>
          <Text style={styles.metricValue}>{data.questions}</Text>
        </View>
      </View>
      <View style={styles.metricCard}>
        <View style={[styles.metricIconWrapper, { backgroundColor: "rgba(8, 146, 103, 0.2)" }]}>
          <FontAwesome name="check-circle" size={24} color="#089267" />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricTitle}>Correct</Text>
          <Text style={styles.metricValue}>{data.correct}</Text>
        </View>
      </View>
      <View style={styles.metricCard}>
        <View style={[styles.metricIconWrapper, { backgroundColor: "rgba(255, 148, 66, 0.2)" }]}>
          <FontAwesome name="trophy" size={24} color="#FF9442" />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricTitle}>Plans Completed</Text>
          <Text style={styles.metricValue}>{data.plansCompleted}</Text>
        </View>
      </View>
      <View style={styles.metricCard}>
        <View style={[styles.metricIconWrapper, { backgroundColor: "rgba(255, 96, 113, 0.2)" }]}>
          <FontAwesome name="clock-o" size={24} color="#FF6071" />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricTitle}>Time Taken</Text>
          <Text style={styles.metricValue}>{data.timeTaken}</Text>
        </View>
      </View>
    </View>
  </View>
);


const SyllabusProgress = ({ data }) => {
  const subjectsToShow = ["Mathematics", "Science", "Social Science", "English"];
  const subjectData = subjectsToShow.map(name => {
    const found = data?.find(item => item.subject.toLowerCase() === name.toLowerCase());
    return { name, progress: found ? parseFloat(found.accuracy_percentage.toFixed(1)) : 0 };
  });

  return (
    <View style={styles.dbCardLarge}>
      <Text style={styles.dbCardTitle}>Overall Syllabus Progress</Text>
      <View style={styles.subjectProgressGrid}>
        {subjectData.map(({ name, progress }) => {
          const styleInfo = getStudyPlanStyleAndMessage(progress);
          return (
            <View key={name} style={[styles.subjectProgressItem, { borderColor: styleInfo.color }]}>
              <Progress.Circle
                size={70}
                progress={progress / 100}
                showsText={true}
                formatText={() => `${progress}%`}
                color={styleInfo.color}
                unfilledColor="#e0e0e0"
                borderWidth={0}
                thickness={6}
                textStyle={{ fontSize: 16, fontWeight: '700', color: styleInfo.color }}
              />
              <Text style={styles.subjectProgressLabel}>{name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};


const SmartRecommendations = ({ data }) => {
  const recommendations = data?.filter(item => item.accuracy_percentage < 40).sort((a, b) => a.accuracy_percentage - b.accuracy_percentage) || [];

  if (recommendations.length === 0) {
    return <PlaceholderCard title="Smart Recommendations" message="Great job! No weak areas to recommend right now." />;
  }

  return (
    <View style={styles.dbCardLarge}>
      <Text style={styles.dbCardTitle}>Smart Recommendations</Text>
      <Text style={styles.recommendationsSubtitle}>Based on your performance and recent activity:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recommendations.map((item, index) => (
          <View key={index} style={styles.recCard}>
            <View style={styles.recCardHeader}><Text style={styles.recCardHeaderText}>Low Score – Revise Soon!</Text></View>
            <View style={styles.recCardBody}>
              <Text style={styles.recTopicName}>{item.topic_name}</Text>
              <View style={styles.recStats}>
                <View style={styles.recStatItem}>
                  <Text style={styles.recStatValue}>{item.accuracy_percentage.toFixed(1)}%</Text>
                  <Text style={styles.recStatLabel}>Accuracy</Text>
                </View>
                <View style={styles.recStatItem}>
                  <Text style={styles.recStatValue}>{item.avg_per_question_time_taken.toFixed(1)}s</Text>
                  <Text style={styles.recStatLabel}>Avg. Time</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const StreaksMilestones = ({ data }) => {
  const streakDaysCount = data?.[0]?.streak_days?.length || 0;
  return (
    <View style={styles.dbCardLarge}>
      <Text style={styles.dbCardTitle}>Streaks & Milestones</Text>
      <View style={styles.streaksGrid}>
        <View style={[styles.streakCard, { backgroundColor: '#7B61FF' }]}>
          <FontAwesome name="fire" size={24} color="#fff" />
          <Text style={styles.streakCardText}>Login Streak</Text>
          <Text style={styles.streakCardValue}>{streakDaysCount > 0 ? `${streakDaysCount} days in a row` : "Start today!"}</Text>
        </View>
        <View style={[styles.streakCard, { backgroundColor: '#20C997' }]}>
          <FontAwesome name="book" size={24} color="#fff" />
          <Text style={styles.streakCardText}>Study Streak</Text>
          <Text style={styles.streakCardValue}>{streakDaysCount > 0 ? `${streakDaysCount} days active` : "No study streak"}</Text>
        </View>
        <View style={[styles.streakCard, { backgroundColor: '#FF6B8A' }]}>
          <MaterialCommunityIcons name="medal" size={24} color="#fff" />
          <Text style={styles.streakCardText}>A New Journey</Text>
          <Text style={styles.streakCardValue}>Let's make it count!</Text>
        </View>
      </View>
    </View>
  );
};


const SubjectPerformancePieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <PlaceholderCard title="Subject-wise Performance" message="Complete quizzes to see your subject performance analysis here." />;
  }

  const chartData = data.map((item, index) => ({
    name: item.subject.charAt(0).toUpperCase() + item.subject.slice(1),
    population: item.accuracy_percentage,
    color: VIBRANT_COLORS[index % VIBRANT_COLORS.length],
    legendFontColor: "#7F7F7F",
    legendFontSize: 14,
  }));

  return (
    <View style={styles.dbCardLarge}>
      <Text style={styles.dbCardTitle}>Subject-wise Performance</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={screenWidth - (isMobile ? 80 : 450)}
          height={220}
          chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>
    </View>
  );
};


const TopicPerformanceBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <PlaceholderCard title="Top 10 Topic Performance" message="Your topic performance will appear here." />;
  }

  const sortedData = [...data].sort((a, b) => b.accuracy_percentage - a.accuracy_percentage).slice(0, 5);

  const chartData = {
    labels: sortedData.map(item => item.topic_name.substring(0, 10) + (item.topic_name.length > 10 ? '...' : '')),
    datasets: [{ data: sortedData.map(item => item.accuracy_percentage) }],
  };

  return (
    <View style={styles.dbCardLarge}>
      <Text style={styles.dbCardTitle}>Top 5 Topic Performance</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={screenWidth - (isMobile ? 80 : 350)}
          height={250}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: theme.cardBg,
            backgroundGradientFrom: theme.cardBg,
            backgroundGradientTo: theme.cardBg,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(68, 63, 225, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForBars: {
              rx: 4,
            }
          }}
          fromZero
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>
    </View>
  );
};


const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = useSelector(selectUserId);
  const apiUrl = "YOUR_API_URL";

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.post(`${apiUrl}${GetDashboardData}`, { user_id_str: userId });
        setDashboardData(response.data?.[0] || {});
        setError(null);
      } catch (err) {
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userId, apiUrl]);

  if (loading) return <View style={styles.dbStateContainer}><ActivityIndicator size="large" color={theme.primaryBlue} /></View>;
  if (error) return <View style={styles.dbStateContainer}><Text>{error}</Text></View>;
  if (!dashboardData || Object.keys(dashboardData).length === 0) return <View style={styles.dbStateContainer}><Text>No analysis data available yet.</Text></View>;

  const dailyProgressData = {
    questions: dashboardData.overall_performance?.[0]?.total_questions || 0,
    correct: dashboardData.overall_performance?.[0]?.total_correct || 0,
    plansCompleted: dashboardData.study_plan_overview?.filter(p => p.completion_percentage === 100).length || 0,
    timeTaken: formatTime(dashboardData.overall_performance?.[0]?.total_time_taken),
  };

  return (
    <ScrollView style={styles.dbPageWrapper}>
      <View style={styles.dbHeader}>
        <Text style={styles.dbTitlePart1}>Dashboard</Text>
      </View>
      <View style={styles.dbMainContent}>
        <View style={styles.dbColumn}>
          <StudyPlanOverview data={dashboardData.study_plan_overview} />
          <DailyProgress data={dailyProgressData} />
          <StreaksMilestones data={dashboardData.streak_tracker} />
          <TopicPerformanceBarChart data={dashboardData.topic_wise_performance} />
        </View>
        <View style={styles.dbColumn}>
          <OverallPerformance data={dashboardData.overall_performance} />
          <SmartRecommendations data={dashboardData.topic_wise_performance} />
          <SyllabusProgress data={dashboardData.subject_wise_performance} />
          <SubjectPerformancePieChart data={dashboardData.subject_wise_performance} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dbPageWrapper: { flex: 1, backgroundColor: "#F8F9FA", padding: isMobile ? 8 : 16 },
  dbHeader: { marginBottom: 24 },
  dbTitlePart1: { color: theme.primaryBlue, fontSize: 32, fontWeight: '700' },
  dbMainContent: { flexDirection: isMobile ? "column" : "row", gap: 24 },
  dbColumn: { flex: 1, flexDirection: "column", gap: 24 },
  dbCardLarge: { backgroundColor: theme.cardBg, borderRadius: 24, padding: 16, gap: 16 },
  dbCardSmall: { backgroundColor: theme.cardBg, borderRadius: 24, padding: 16, gap: 16, minHeight: 250 },
  dbCardTitle: { color: theme.darkText, fontSize: 20, fontWeight: '700' },
  themeCardLightBlue: { backgroundColor: theme.bgLightBlue },
  dailyProgressHeader: { gap: 8 },
  dailyProgressQuote: { backgroundColor: '#E0E7FF', color: theme.primaryBlue, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, fontSize: 14, fontWeight: '500', alignSelf: 'flex-start' },
  dailyProgressGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 16 },
  metricCard: { flexBasis: isMobile ? '100%' : '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 16 },
  metricIconWrapper: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  metricInfo: { flexDirection: "column" },
  metricTitle: { fontSize: 14, color: theme.lightText },
  metricValue: { fontSize: 20, fontWeight: '700', color: theme.darkText },
  opContent: { alignItems: "center", justifyContent: "center", gap: 12, flex: 1 },
  opStarsContainer: { flexDirection: 'row', gap: 8 },
  opStarIcon: { fontSize: 36, color: '#ffc107' },
  opAccuracy: { fontSize: 28, fontWeight: '700', color: theme.darkText },
  opAccuracyLabel: { fontSize: 16, color: theme.lightText },
  subjectProgressGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16 },
  subjectProgressItem: { flexBasis: isMobile ? '100%' : '47%', alignItems: "center", gap: 8, padding: 12, backgroundColor: "#F8F9FA", borderRadius: 16, borderWidth: 2 },
  subjectProgressLabel: { fontSize: 14, fontWeight: '600', color: theme.darkText },
  streaksGrid: { flexDirection: isMobile ? "column" : "row", gap: 16, marginTop: 16 },
  streakCard: { flex: 1, borderRadius: 16, padding: 20, gap: 8 },
  streakCardText: { color: '#fff', fontSize: 16 },
  streakCardValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  chartContainer: { alignItems: 'center', justifyContent: 'center', minHeight: 250 },
  dbStateContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  studyPlanGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: 'center', marginTop: 16 },
  studyPlanItem: { width: isMobile ? '45%' : 'auto', minWidth: 150, alignItems: "center", gap: 12, padding: 16, backgroundColor: "#F8F9FA", borderRadius: 16, borderWidth: 2 },
  studyPlanLabel: { fontSize: 16, fontWeight: '600', color: theme.darkText, textAlign: 'center' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  statusBadge_completed: { backgroundColor: theme.progressExcellentBg },
  statusBadgeText_completed: { color: theme.progressExcellentColor },
  statusBadge_excellent: { backgroundColor: theme.progressPlanExcellentBg },
  statusBadgeText_excellent: { color: theme.progressPlanExcellentColor },
  statusBadge_awesome: { backgroundColor: theme.progressAwesomeBg },
  statusBadgeText_awesome: { color: theme.progressAwesomeColor },
  statusBadge_growing: { backgroundColor: theme.progressGrowingBg },
  statusBadgeText_growing: { color: theme.progressGrowingColor },
  statusBadge_hurryUp: { backgroundColor: theme.progressHurryUpBg },
  statusBadgeText_hurryUp: { color: theme.progressHurryUpColor },
  statusBadge_notStarted: { backgroundColor: theme.progressNotStartedBg },
  statusBadgeText_notStarted: { color: theme.progressNotStartedColor },
  recommendationsSubtitle: { fontSize: 16, color: theme.lightText, marginBottom: 8 },
  recCard: { backgroundColor: '#F0F7FF', borderRadius: 16, overflow: 'hidden', width: 260, marginRight: 16 },
  recCardHeader: { backgroundColor: '#0d2e4a', padding: 12 },
  recCardHeaderText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  recCardBody: { padding: 16, alignItems: "center", gap: 12 },
  recTopicName: { fontSize: 16, fontWeight: '700', color: theme.darkText, textAlign: 'center' },
  recStats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingTop: 12, borderTopWidth: 1, borderColor: '#d4e3f3' },
  recStatItem: { alignItems: "center", gap: 4 },
  recStatValue: { fontSize: 16, fontWeight: '700', color: theme.darkText },
  recStatLabel: { fontSize: 12, color: theme.lightText },
  placeholderCard: { justifyContent: "center", alignItems: "center", minHeight: 200 },
  placeholderContent: { alignItems: "center", gap: 16 },
  placeholderText: { fontSize: 16, lineHeight: 24, textAlign: "center", color: theme.lightText, paddingHorizontal: 16 },
});

export default Dashboard;