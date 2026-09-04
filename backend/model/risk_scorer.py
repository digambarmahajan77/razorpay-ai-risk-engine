class RiskScorer:
    """
    Risk Score Calibration and Action Recommendation Engine for RakshaPay.
    Maps calibrated ML prediction probability to 0-100 Risk Score.
    """
    
    @staticmethod
    def calculate_risk_score(raw_probability, tx_dict=None):
        """
        Converts probability (0.0 - 1.0) into a calibrated risk score (0 - 100).
        Applies non-linear scaling to ensure sharp differentiation between normal and suspicious transactions.
        """
        prob = float(raw_probability)
        
        # Non-linear logistic calibration for clean score distribution
        if prob <= 0.10:
            score = prob * 200.0  # 0.0 -> 0, 0.10 -> 20
        elif prob <= 0.40:
            score = 20.0 + (prob - 0.10) * 100.0  # 0.10 -> 20, 0.40 -> 50
        elif prob <= 0.70:
            score = 50.0 + (prob - 0.40) * 83.33  # 0.40 -> 50, 0.70 -> 75
        else:
            score = 75.0 + (prob - 0.70) * 83.33  # 0.70 -> 75, 1.0 -> 100
            
        score = int(round(max(0, min(100, score))))
        
        # Classify risk level
        if score <= 30:
            risk_level = "LOW RISK"
            recommended_action = "APPROVE"
            action_description = "Transaction cleared for automatic processing."
        elif score <= 70:
            risk_level = "MEDIUM RISK"
            recommended_action = "REVIEW"
            action_description = "Secondary review or light verification recommended before settlement."
        else:
            risk_level = "HIGH RISK"
            recommended_action = "VERIFY"
            action_description = "Strict step-up authentication (2FA/OTP) or agent verification required."
            
        return {
            'risk_score': score,
            'risk_level': risk_level,
            'fraud_probability': round(prob, 4),
            'recommended_action': recommended_action,
            'action_description': action_description
        }
