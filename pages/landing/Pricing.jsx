import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import api from "../../utils/apiLogger";
import { SubscriptionEndpoint, apiUrl } from "../../config/config";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { selectUser } from "../../redux/authSlice";
import { theme } from '../../styles/theme';

const PricingCard = ({ plan, token }) => {
    const navigation = useNavigation();
    const user = useSelector(selectUser);

    const handlePayment = () => {
        if (!user.token) {
            navigation.navigate('Login');
            return;
        }
        navigation.navigate('Payment', { plan });
    };

    return (
        <View style={[styles.pricingCard, plan.isPopular && styles.popularCard]}>
            {plan.isPopular && <View style={styles.popularBadge}><Text style={styles.popularBadgeText}>Most Popular</Text></View>}
            <Text style={[styles.planName, plan.isPopular && { color: 'white' }]}>{plan.name}</Text>
            <Text style={[styles.planPrice, plan.isPopular && { color: 'white' }]}>
                {plan.price}<Text style={styles.pricePeriod}>/{plan.period}</Text>
            </Text>
            {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                    <Text style={[styles.featureText, plan.isPopular && { color: 'white' }]}>✓ {feature}</Text>
                </View>
            ))}
            <TouchableOpacity 
                style={[styles.subscribeButton, plan.isPopular && styles.popularButton]}
                onPress={plan.name === "Basic" && token ? () => {} : handlePayment}
                disabled={plan.name === "Basic" && token}
            >
                <Text style={[styles.buttonText, plan.isPopular && styles.popularButtonText]}>
                    {plan.name === "Basic" && token ? "Current Plan" : "Subscribe"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const Pricing = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector(selectUser);

    useEffect(() => {
        api.post(`${apiUrl}${SubscriptionEndpoint}`)
           .then(res => setPlans(res.data))
           .catch(err => console.error(err))
           .finally(() => setLoading(false));
    }, []);

    return (
        <View style={styles.pricingSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}><Text style={{ color: theme.colors.primary }}>Transforming Aspiring Minds</Text> using AI Tools</Text>
            </View>
            {loading ? <ActivityIndicator size="large" /> :
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pricingGrid}>
                    {plans.map(plan => <PricingCard key={plan._id} plan={plan} token={token} />)}
                </ScrollView>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    pricingSection: { paddingVertical: 40, alignItems: 'center' },
    sectionHeader: { marginBottom: 24, paddingHorizontal: 15 },
    sectionTitle: { fontSize: 28, fontWeight: '700', textAlign: 'center', lineHeight: 36 },
    pricingGrid: { paddingHorizontal: 20 },
    pricingCard: { width: 300, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'white', marginRight: 16, gap: 16 },
    popularCard: { backgroundColor: theme.colors.primary, transform: [{ scale: 1.05 }], zIndex: 10 },
    popularBadge: { position: 'absolute', top: 20, right: 20, borderWidth: 1, borderColor: 'white', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
    popularBadgeText: { color: 'white', fontWeight: '500' },
    planName: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
    planPrice: { fontSize: 32, fontWeight: '700', color: '#242424' },
    pricePeriod: { fontSize: 18, fontWeight: '700' },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    featureText: { fontSize: 16, color: '#242424' },
    subscribeButton: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginTop: 'auto' },
    popularButton: { backgroundColor: 'white' },
    buttonText: { color: 'white', fontWeight: '600' },
    popularButtonText: { color: theme.colors.primary },
});

export default Pricing;