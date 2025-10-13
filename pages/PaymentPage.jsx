import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const BackButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Icon name="arrow-left" size={18} color="#343a40" />
    </TouchableOpacity>
  );
};

const PaymentPage = () => {
  const { params } = useRoute();
  const state = params || {};
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobileLayout = width < 768;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardName: '',
    upiId: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = useCallback((value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  }, []);

  const formatExpiryDate = useCallback((value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  }, []);

  useEffect(() => {
    if (!state?.plan || !state?.price || !state?.cycle) {
      navigation.replace('Upgrade');
    }
  }, [state, navigation]);

  if (!state?.plan || !state?.price || !state?.cycle) {
    return null;
  }

  const validateForm = useCallback(() => {
    const newErrors = {};
    const { cardNumber, cardName, expiry, cvc, upiId, accountNumber, ifscCode } = formData;

    if (paymentMethod === 'card') {
      if (!cardName.trim()) newErrors.cardName = 'Name on card is required';
      const cleanedCardNumber = cardNumber.replace(/\s/g, '');
      if (!cleanedCardNumber) newErrors.cardNumber = 'Card number is required';
      else if (!/^\d{16}$/.test(cleanedCardNumber)) newErrors.cardNumber = 'Invalid card number (must be 16 digits)';
      if (!expiry.trim()) newErrors.expiry = 'Expiry is required';
      else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) newErrors.expiry = 'Invalid expiry date (MM/YY)';
      if (!cvc.trim()) newErrors.cvc = 'CVC is required';
      else if (!/^\d{3,4}$/.test(cvc)) newErrors.cvc = 'Invalid CVC';
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim()) newErrors.upiId = 'UPI ID is required';
      else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) newErrors.upiId = 'Invalid UPI ID format';
    } else if (paymentMethod === 'netBanking') {
      if (!accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
      if (!ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [paymentMethod, formData]);

  const handlePayment = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    setErrors({});
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    navigation.navigate('PaymentSuccess', { plan: state.plan, price: state.price });
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    if (field === 'cardNumber') formattedValue = formatCardNumber(value);
    else if (field === 'expiry') formattedValue = formatExpiryDate(value);
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const InputField = ({ label, iconName, placeholder, value, onChangeText, error, ...props }) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={[styles.inputGroup, error ? styles.inputError : {}]}>
        <View style={styles.inputIconContainer}>
          <Icon name={iconName} size={16} color="#6c757d" />
        </View>
        <TextInput
          style={styles.formControl}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.paymentContainer}>
        <BackButton />
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={{ width: isMobileLayout ? '100%' : '90%' }}>
            <Text style={styles.paymentTitle}>Secure Checkout</Text>
            <View style={styles.paymentCard}>
              <View style={{ flexDirection: isMobileLayout ? 'column' : 'row' }}>
                <View style={isMobileLayout ? styles.orderSummarySectionMobile : styles.orderSummarySection}>
                  <Text style={styles.sectionHeader}>Order Summary</Text>
                  <View style={styles.planDetails}>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: 'bold' }}>Plan:</Text> {state.plan}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: 'bold' }}>Billing Cycle:</Text> <Text style={{ textTransform: 'capitalize' }}>{state.cycle}</Text>
                    </Text>
                  </View>
                  <View style={styles.hr} />
                  <View style={styles.priceDetails}>
                    <Text style={styles.detailText}>Total Amount</Text>
                    <Text style={styles.totalPriceText}>{state.price}</Text>
                  </View>
                  <View style={styles.secureInfo}>
                    <Icon name="lock" size={14} color="#28a745" />
                    <Text style={styles.secureInfoText}> Secure SSL Encrypted Payment</Text>
                  </View>
                </View>

                <View style={styles.paymentMethodSection}>
                  <Text style={styles.sectionHeader}>Payment Information</Text>
                  <View style={styles.paymentOptions}>
                    {['card', 'upi', 'netBanking'].map((method) => (
                      <TouchableOpacity
                        key={method}
                        style={[styles.paymentOption, paymentMethod === method && styles.selectedOption]}
                        onPress={() => !isProcessing && setPaymentMethod(method)}
                      >
                        <Icon
                          name={method === 'card' ? 'credit-card' : method === 'upi' ? 'mobile' : 'university'}
                          size={18}
                          color={paymentMethod === method ? '#fff' : '#495057'}
                        />
                        <Text style={[styles.optionText, paymentMethod === method && styles.selectedOptionText]}>
                          {method === 'netBanking' ? 'Net Banking' : method.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {paymentMethod === 'card' && (
                    <View>
                      <InputField label="Name on Card" iconName="user" placeholder="John M. Doe" value={formData.cardName} onChangeText={(val) => handleInputChange('cardName', val)} error={errors.cardName} editable={!isProcessing} />
                      <InputField label="Card Number" iconName="credit-card" placeholder="xxxx xxxx xxxx xxxx" value={formData.cardNumber} onChangeText={(val) => handleInputChange('cardNumber', val)} error={errors.cardNumber} keyboardType="numeric" maxLength={19} editable={!isProcessing} />
                      <View style={{ flexDirection: 'row', gap: 15 }}>
                        <View style={{ flex: 1 }}>
                          <InputField label="Expiry Date" iconName="calendar" placeholder="MM/YY" value={formData.expiry} onChangeText={(val) => handleInputChange('expiry', val)} error={errors.expiry} keyboardType="numeric" maxLength={5} editable={!isProcessing} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <InputField label="CVC" iconName="lock" placeholder="123" value={formData.cvc} onChangeText={(val) => handleInputChange('cvc', val)} error={errors.cvc} keyboardType="numeric" maxLength={4} secureTextEntry editable={!isProcessing} />
                        </View>
                      </View>
                    </View>
                  )}
                  {paymentMethod === 'upi' && (
                    <InputField label="UPI ID" iconName="mobile" placeholder="yourname@bank" value={formData.upiId} onChangeText={(val) => handleInputChange('upiId', val)} error={errors.upiId} autoCapitalize="none" editable={!isProcessing} />
                  )}
                  {paymentMethod === 'netBanking' && (
                    <View>
                      <InputField label="Account Number" iconName="university" placeholder="Enter Account Number" value={formData.accountNumber} onChangeText={(val) => handleInputChange('accountNumber', val)} error={errors.accountNumber} keyboardType="numeric" editable={!isProcessing} />
                      <InputField label="IFSC Code" iconName="university" placeholder="Enter IFSC Code" value={formData.ifscCode} onChangeText={(val) => handleInputChange('ifscCode', val)} error={errors.ifscCode} autoCapitalize="characters" editable={!isProcessing} />
                    </View>
                  )}

                  <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isProcessing}>
                    {isProcessing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.payButtonText}>Pay {state.price}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  paymentContainer: { paddingTop: 20, paddingBottom: 40, paddingHorizontal: 15 },
  backButton: { position: 'absolute', top: 20, left: 15, zIndex: 10, padding: 5 },
  paymentTitle: { fontSize: 24, fontWeight: '600', color: '#343a40', textAlign: 'center', marginBottom: 20 },
  paymentCard: {
    borderWidth: 1, borderColor: '#dee2e6', borderRadius: 15, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
    overflow: 'hidden',
  },
  orderSummarySection: { backgroundColor: '#f1f3f5', padding: 25, flex: 2, borderRightWidth: 1, borderRightColor: '#dee2e6' },
  orderSummarySectionMobile: { backgroundColor: '#f1f3f5', padding: 20, borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  paymentMethodSection: { padding: 25, flex: 3 },
  sectionHeader: { fontSize: 18, fontWeight: '500', color: '#495057', borderBottomWidth: 1, borderBottomColor: '#e9ecef', paddingBottom: 12, marginBottom: 20 },
  planDetails: { marginBottom: 15 },
  detailText: { fontSize: 16, color: '#495057', marginBottom: 8 },
  hr: { height: 1, backgroundColor: '#e9ecef', marginVertical: 15 },
  priceDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalPriceText: { fontSize: 20, fontWeight: '600', color: '#0d6efd' },
  secureInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25 },
  secureInfoText: { fontSize: 14, color: '#6c757d', marginLeft: 5 },
  paymentOptions: { flexDirection: 'row', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, overflow: 'hidden', marginBottom: 20 },
  paymentOption: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  selectedOption: { backgroundColor: '#0d6efd' },
  optionText: { color: '#495057', fontWeight: '500' },
  selectedOptionText: { color: '#fff' },
  inputWrapper: { marginBottom: 15 },
  formLabel: { fontWeight: '500', marginBottom: 6, color: '#495057', fontSize: 14 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8 },
  inputIconContainer: { paddingHorizontal: 12, backgroundColor: '#e9ecef', height: '100%', justifyContent: 'center', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderRightWidth: 1, borderRightColor: '#ced4da' },
  formControl: { flex: 1, height: 48, paddingHorizontal: 12, fontSize: 16 },
  inputError: { borderColor: '#dc3545' },
  errorText: { color: '#dc3545', fontSize: 12, marginTop: 4 },
  payButton: { backgroundColor: '#198754', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  payButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

export default PaymentPage;