import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const plansData = {
  titleAfterLogin: "Choose the Plan That's Right for You",
  disclaimerAfterLogin: "Plans and pricing are subject to change. Please review the details before upgrading.",
  plans: [
    { name: "Basic", price: "$0", tokens: 10, validity: "1 Month", current: true },
    { name: "Standard", price: "$9.99", tokens: 100, validity: "1 Month" },
    { name: "Pro", price: "$19.99", tokens: 500, validity: "1 Month" },
    { name: "Enterprise", price: "$49.99", tokens: 2000, validity: "1 Month", soonAfterLogin: true }
  ]
};

const PlanCard = ({ plan, userPlan }) => {
    const isCurrentPlan = userPlan === plan.name.toLowerCase();
    
    return (
        <View style={[styles.planCard, isCurrentPlan && styles.selectedPlan]}>
            <View style={[styles.planHeader, styles[`header${plan.name}`]]}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>
                    {plan.price}
                    <Text style={styles.planPeriod}>/month</Text>
                </Text>
            </View>
            <View style={styles.planBody}>
                <View style={styles.planFeatures}>
                    <View style={styles.featureItem}>
                        <Icon name="check-circle" color="#28a745" size={16} />
                        <Text style={styles.featureText}>{plan.tokens} Tokens per day</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Icon name="check-circle" color="#28a745" size={16} />
                        <Text style={styles.featureText}>Validity for {plan.validity}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.upgradeButton, styles[`button${plan.name}`], (isCurrentPlan || plan.soonAfterLogin) && styles.disabledButton]}
                    disabled={isCurrentPlan || plan.soonAfterLogin}
                >
                    <Text style={styles.buttonText}>
                        {isCurrentPlan ? "Current Plan" : (plan.soonAfterLogin ? "Coming Soon" : "Upgrade")}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const Upgrade = () => {
  const userPlan = 'basic';
  const data = plansData;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.upgradeContainer}>
        <Text style={styles.upgradeTitle}>{data.titleAfterLogin}</Text>
        <View style={styles.plansRow}>
            {data.plans.map((plan, index) => (
                <View style={styles.planColumn} key={index}>
                    <PlanCard plan={plan} userPlan={userPlan} />
                </View>
            ))}
        </View>
        <Text style={styles.upgradeDisclaimer}>{data.disclaimerAfterLogin}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  upgradeContainer: { paddingVertical: 30, paddingHorizontal: 15 },
  upgradeTitle: { fontSize: 26, fontWeight: '600', color: '#343a40', textAlign: 'center', marginBottom: 30 },
  plansRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -10 },
  planColumn: { width: '50%', padding: 10 },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
    height: '100%',
  },
  selectedPlan: { borderWidth: 2, borderColor: '#007bff' },
  planHeader: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
  headerBasic: { backgroundColor: '#f8f9fa' },
  headerStandard: { backgroundColor: '#fff3cd' },
  headerPro: { backgroundColor: '#e9ecef' },
  headerEnterprise: { backgroundColor: '#d1ecf1' },
  planName: { fontSize: 20, fontWeight: '600', color: '#495057' },
  planPrice: { fontSize: 24, fontWeight: '700', color: '#212529', marginTop: 5 },
  planPeriod: { fontSize: 14, color: '#6c757d', fontWeight: '400' },
  planBody: { padding: 20, flex: 1, justifyContent: 'space-between' },
  planFeatures: { marginBottom: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureText: { fontSize: 15, color: '#495057', marginLeft: 10 },
  upgradeButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  disabledButton: { backgroundColor: '#ccc' },
  buttonBasic: { backgroundColor: '#6c757d' },
  buttonStandard: { backgroundColor: '#28a745' },
  buttonPro: { backgroundColor: '#007bff' },
  buttonEnterprise: { backgroundColor: '#343a40' },
  upgradeDisclaimer: { fontSize: 14, color: '#6c757d', textAlign: 'center', marginTop: 25 },
});

export default Upgrade;