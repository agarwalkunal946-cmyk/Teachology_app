import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { theme } from '../styles/theme';

const data = {
  titleBeforeLogin: 'Our Services',
  descriptionBeforeLogin: 'Explore our plans and features.',
  sideTextBeforeLogin: 'Choose a plan that works for you.',
  sideDescriptionBeforeLogin: 'Unlock your potential with our tailored AI services.',
  plans: [{ name: 'Basic Plan', tokens: '1000', validity: '1 Month' }, { name: 'Pro Plan', tokens: '5000', validity: '1 Month' }],
};

const Services = () => {
    const navigation = useNavigation();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.mainTitle}>{data.titleBeforeLogin}</Text>
            <Text style={styles.mainDescription}>{data.descriptionBeforeLogin}</Text>
            <View style={styles.contentRow}>
                <View style={styles.sideContent}>
                    <Text style={styles.sideTitle}>{data.sideTextBeforeLogin}</Text>
                    <Text style={styles.sideDescription}>{data.sideDescriptionBeforeLogin}</Text>
                </View>
                <View style={styles.plansContainer}>
                    {data.plans.map((plan, index) => (
                        <View style={styles.serviceItem} key={index}>
                            <Text style={styles.planName}>{plan.name}</Text>
                            <Text style={styles.planDetail}>• {plan.tokens} Tokens per day</Text>
                            <Text style={styles.planDetail}>• Valid for {plan.validity}</Text>
                            <TouchableOpacity style={styles.subscribeButton} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.subscribeButtonText}>Subscribe</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  mainDescription: { textAlign: 'center', color: '#666', marginBottom: 30 },
  contentRow: { flexDirection: 'column' },
  sideContent: { marginBottom: 20 },
  sideTitle: { fontSize: 20, fontWeight: 'bold' },
  sideDescription: { color: '#555', marginTop: 10 },
  plansContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceItem: { width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 8, elevation: 2, marginBottom: 15 },
  planName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  planDetail: { marginBottom: 5 },
  subscribeButton: { backgroundColor: theme.colors.primary, padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  subscribeButtonText: { color: 'white' },
});

export default Services;