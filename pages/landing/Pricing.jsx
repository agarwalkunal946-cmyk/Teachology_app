import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import api from "../../utils/apiLogger";
import { SubscriptionEndpoint, CreateOrderEndpoint, VerifyPaymentEndpoint } from "../../config/config";
import { useSelector } from "react-redux";
import { selectUserId, selectUserEmail, selectUser } from "../../redux/authSlice";
import { useNavigation } from "@react-navigation/native";
import Toast from 'react-native-toast-message'; // Assuming you use a library like this
// import RazorpayCheckout from 'react-native-razorpay'; // You need to install this package

const PricingCard = ({ plan, userId, userEmail, userName, userPhone, token }) => {
  const apiUrl = process.env.VITE_APP_API_BASE_URL;
  const navigation = useNavigation();

  const handlePayment = async () => {
    // This is a placeholder for the Razorpay logic.
    // The actual implementation will depend on the `react-native-razorpay` package.
    Toast.show({ type: 'info', text1: 'Payment integration is a placeholder.' });
  };
  
  return (
    <View style={[styles.pricingCard, plan.isPopular && styles.popularCard]}>
      {plan.isPopular && <View style={styles.popularBadge}><Text style={styles.popularBadgeText}>Most Popular</Text></View>}
      <Text style={styles.planName}>{plan.name}</Text>
      <View style={styles.planPriceContainer}>
        <Text style={styles.planPrice}>{plan.price}</Text>
        <Text style={styles.pricePeriod}>{plan.period}</Text>
      </View>
      <View style={styles.featuresList}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.subButton, plan.isPopular ? styles.popularButton : styles.defaultButton]}
        onPress={plan.name === "Basic" ? () => !token && navigation.navigate("Login") : handlePayment}
        disabled={plan.name === "Basic" && token}
      >
        <Text style={[styles.subButtonText, plan.isPopular && styles.popularButtonText]}>
          {plan.name === "Basic" && !token ? "Subscribe" : plan.buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.VITE_APP_API_BASE_URL;

  const userId = useSelector(selectUserId);
  const userEmail = useSelector(selectUserEmail);
  const authState = useSelector(selectUser);
  const token = useSelector((state) => state.auth.token);
  const userName = authState?.name;
  const userPhone = authState?.phoneno;

  useEffect(() => {
    api.post(`${apiUrl}${SubscriptionEndpoint}`)
      .then((res) => setPlans(res.data))
      .catch((err) => Toast.show({ type: 'error', text1: 'Failed to load pricing plans.' }))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  if (loading) {
    return <ActivityIndicator size="large" color="#443fe1" style={{ marginVertical: 40 }} />;
  }

  return (
    <View style={styles.pricingSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          <Text style={styles.textPrimary}>Transforming Aspiring Minds</Text> using AI Tools
        </Text>
      </View>
      <View style={styles.pricingGrid}>
        {plans.map((plan) => (
          <PricingCard
            key={plan._id}
            plan={plan}
            userId={userId}
            userEmail={userEmail}
            userName={userName}
            userPhone={userPhone}
            token={token}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pricingSection: { padding: 20, backgroundColor: '#f0f4ff' },
  sectionHeader: { alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center' },
  textPrimary: { color: '#443fe1' },
  pricingGrid: { gap: 20 },
  pricingCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#e0e0e0' },
  popularCard: { borderColor: '#443fe1', borderWidth: 2 },
  popularBadge: { position: 'absolute', top: -1, right: 20, backgroundColor: '#443fe1', paddingHorizontal: 12, paddingVertical: 6, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  popularBadgeText: { color: 'white', fontWeight: 'bold' },
  planName: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginBottom: 16 },
  planPriceContainer: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 24 },
  planPrice: { fontSize: 40, fontWeight: 'bold', color: '#1a1a1a' },
  pricePeriod: { fontSize: 16, color: '#555555', marginLeft: 4 },
  featuresList: { marginBottom: 24, gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { color: '#443fe1', marginRight: 8, fontSize: 16 },
  featureText: { fontSize: 16, color: '#333333' },
  subButton: { paddingVertical: 14, borderRadius: 50, alignItems: 'center' },
  defaultButton: { backgroundColor: '#443fe1' },
  popularButton: { backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#443fe1' },
  subButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  popularButtonText: { color: '#443fe1' },
});

export default Pricing;