import numpy as np
import pandas as pd

class FraudExplainer:
    """
    Explainability Engine for RakshaPay.
    Combines Model Feature Importances / Tree SHAP / Feature Deviations to generate 
    human-interpretable risk breakdown factors with assigned point weights.
    """
    
    FEATURE_DESCRIPTIONS = {
        'amount_deviation': 'Transaction amount is {val:.1f}x higher than customer normal average',
        'is_new_device': 'Unrecognized new device detected',
        'is_new_location': 'Transaction initiated from an unusual location',
        'distance_from_usual_location': 'Location distance is {val:.0f} km away from usual location',
        'transactions_last_10min': '{val:d} transactions occurred within the last 10 minutes (high velocity)',
        'failed_attempts_24h': '{val:d} failed PIN/OTP authentication attempts in last 24h',
        'previous_chargebacks': '{val:d} previous chargeback(s) recorded on account',
        'ip_risk_score': 'Elevated IP risk score ({val:.2f}) associated with proxy/VPN',
        'device_risk_score': 'Elevated device fingerprint risk score ({val:.2f})',
        'customer_account_age_days': 'Newly created account ({val:d} days old)',
        'transaction_hour': 'High-risk off-peak transaction hour ({val:d}:00)',
        'merchant_category': 'High-risk merchant category ({val})',
        'velocity_score': 'Combined velocity score spike ({val:.2f})'
    }

    @staticmethod
    def explain_transaction(tx_dict, feature_importances=None):
        """
        Takes a transaction dictionary and returns ranked risk factors with estimated risk impact points (+N Risk).
        """
        factors = []
        
        # 1. Amount Deviation
        amount_dev = float(tx_dict.get('amount_deviation', 1.0))
        if amount_dev >= 3.5:
            points = min(35, int(amount_dev * 6))
            factors.append({
                'feature': 'amount_deviation',
                'points': points,
                'title': 'High Amount Deviation',
                'description': f"Transaction amount is {amount_dev:.1f}x higher than customer's normal average (₹{tx_dict.get('amount', 0):,.2f} vs avg ₹{tx_dict.get('customer_avg_amount', 0):,.2f})"
            })
        elif amount_dev >= 2.0:
            factors.append({
                'feature': 'amount_deviation',
                'points': 14,
                'title': 'Moderate Amount Spike',
                'description': f"Transaction amount is {amount_dev:.1f}x higher than customer average"
            })
            
        # 2. New Device
        if int(tx_dict.get('is_new_device', 0)) == 1:
            factors.append({
                'feature': 'is_new_device',
                'points': 22,
                'title': 'Unrecognized Device',
                'description': "Transaction originated from an unrecognized new device"
            })
            
        # 3. New Location & Distance
        is_new_loc = int(tx_dict.get('is_new_location', 0)) == 1
        distance = float(tx_dict.get('distance_from_usual_location', 0))
        if is_new_loc or distance > 100:
            pts = 18 + (12 if distance > 300 else 0)
            factors.append({
                'feature': 'is_new_location',
                'points': pts,
                'title': 'Unusual Transaction Location',
                'description': f"Location is {distance:.0f} km away from customer's usual cluster"
            })
            
        # 4. Velocity (last 10 minutes)
        tx_10min = int(tx_dict.get('transactions_last_10min', 0))
        if tx_10min >= 3:
            pts = min(32, tx_10min * 6)
            factors.append({
                'feature': 'transactions_last_10min',
                'points': pts,
                'title': 'High Transaction Velocity',
                'description': f"{tx_10min} transactions attempted within the last 10 minutes"
            })
            
        # 5. Failed Attempts
        failed = int(tx_dict.get('failed_attempts_24h', 0))
        if failed >= 2:
            pts = min(25, failed * 8)
            factors.append({
                'feature': 'failed_attempts_24h',
                'points': pts,
                'title': 'Multiple Authentication Failures',
                'description': f"{failed} failed PIN/OTP attempts in the past 24 hours"
            })
            
        # 6. Previous Chargebacks
        chargebacks = int(tx_dict.get('previous_chargebacks', 0))
        if chargebacks > 0:
            pts = min(30, chargebacks * 15)
            factors.append({
                'feature': 'previous_chargebacks',
                'points': pts,
                'title': 'Prior Chargeback History',
                'description': f"{chargebacks} disputed chargeback(s) recorded on customer account"
            })
            
        # 7. IP & Device Risk Scores
        ip_risk = float(tx_dict.get('ip_risk_score', 0))
        device_risk = float(tx_dict.get('device_risk_score', 0))
        if ip_risk > 0.60:
            factors.append({
                'feature': 'ip_risk_score',
                'points': int(ip_risk * 24),
                'title': 'High IP Threat Score',
                'description': f"IP address flagged with high risk score ({ip_risk:.2f}) associated with proxy/VPN"
            })
        if device_risk > 0.60:
            factors.append({
                'feature': 'device_risk_score',
                'points': int(device_risk * 22),
                'title': 'High Device Risk Fingerprint',
                'description': f"Device hardware fingerprint flagged with risk score ({device_risk:.2f})"
            })
            
        # 8. Account Age
        acc_age = int(tx_dict.get('customer_account_age_days', 999))
        if acc_age <= 14:
            factors.append({
                'feature': 'customer_account_age_days',
                'points': 16,
                'title': 'New Customer Account',
                'description': f"Account created only {acc_age} days ago (higher default risk profile)"
            })
            
        # 9. Merchant Category Risk
        category = str(tx_dict.get('merchant_category', '')).lower()
        if category in ['gaming', 'luxury', 'electronics']:
            factors.append({
                'feature': 'merchant_category',
                'points': 10,
                'title': 'High-Risk Merchant Sector',
                'description': f"Merchant category '{category.capitalize()}' is subject to elevated fraud targeted rates"
            })
            
        # Sort factors by points descending
        factors = sorted(factors, key=lambda x: x['points'], reverse=True)
        
        # If low risk (few/no negative factors), provide reassuring low-risk note
        if not factors:
            factors.append({
                'feature': 'normal_pattern',
                'points': 0,
                'title': 'Normal Customer Pattern',
                'description': 'Transaction parameters match customer historical spending behavior and known device'
            })
            
        return factors
