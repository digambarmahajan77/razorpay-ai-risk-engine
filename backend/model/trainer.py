import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    precision_score, recall_score, f1_score, accuracy_score, 
    roc_auc_score, confusion_matrix
)
from sklearn.preprocessing import OneHotEncoder

from model.generator import generate_synthetic_transactions

# Try importing XGBoost
try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

NUMERICAL_FEATURES = [
    'amount', 'transaction_hour', 'transaction_day', 'customer_age',
    'customer_transaction_count_24h', 'customer_avg_amount', 'amount_deviation',
    'is_new_device', 'is_new_location', 'distance_from_usual_location',
    'failed_attempts_24h', 'transactions_last_10min', 'customer_account_age_days',
    'previous_chargebacks', 'ip_risk_score', 'device_risk_score', 'velocity_score'
]

CATEGORICAL_FEATURES = ['payment_method', 'merchant_category']

class MLPipeline:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        self.model = None
        self.encoder = None
        self.feature_names = None

    def preprocess(self, df, is_training=True):
        """
        Extract numerical features and one-hot encode categorical features.
        """
        X_num = df[NUMERICAL_FEATURES].values
        
        if is_training:
            self.encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
            X_cat = self.encoder.fit_transform(df[CATEGORICAL_FEATURES])
            cat_feature_names = list(self.encoder.get_feature_names_out(CATEGORICAL_FEATURES))
            self.feature_names = NUMERICAL_FEATURES + cat_feature_names
        else:
            X_cat = self.encoder.transform(df[CATEGORICAL_FEATURES])
            
        X = np.hstack([X_num, X_cat])
        return X

    def train_and_evaluate(self, n_samples=10000, random_state=42, review_cost=25.0):
        print(f"Generating {n_samples} realistic transactions for training...")
        df = generate_synthetic_transactions(n_samples=n_samples, random_state=random_state)
        
        # Save raw dataset
        raw_csv_path = os.path.join(self.data_dir, "synthetic_transactions.csv")
        df.to_csv(raw_csv_path, index=False)
        
        X = self.preprocess(df, is_training=True)
        y = df['fraud_label'].values
        
        # Stratified 80/20 train/test split
        X_train, X_test, y_train, y_test, df_train, df_test = train_test_split(
            X, y, df, test_size=0.20, random_state=random_state, stratify=y
        )
        
        print(f"Dataset split: Train={len(X_train)} samples, Held-out Test={len(X_test)} samples.")
        
        # Train Model
        scale_pos_weight = float((len(y_train) - sum(y_train)) / sum(y_train))
        if HAS_XGBOOST:
            print("Training XGBoost Classifier...")
            self.model = xgb.XGBClassifier(
                n_estimators=150,
                max_depth=6,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                scale_pos_weight=scale_pos_weight,
                random_state=random_state,
                eval_metric='logloss'
            )
            model_type = "XGBoost Classifier (Calibrated)"
        else:
            print("XGBoost not available; Training RandomForestClassifier...")
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=12,
                class_weight='balanced',
                random_state=random_state,
                n_jobs=-1
            )
            model_type = "RandomForest Classifier (Balanced)"
            
        self.model.fit(X_train, y_train)
        
        # Evaluate on HELD-OUT TEST SET
        y_pred_prob = self.model.predict_proba(X_test)[:, 1]
        y_pred = (y_pred_prob >= 0.40).astype(int) # Slightly lower threshold to favor recall
        
        prec = float(precision_score(y_test, y_pred))
        rec = float(recall_score(y_test, y_pred))
        f1 = float(f1_score(y_test, y_pred))
        acc = float(accuracy_score(y_test, y_pred))
        roc_auc = float(roc_auc_score(y_test, y_pred_prob))
        
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = [int(val) for val in cm.ravel()]
        
        fp_rate = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
        fp_cost = float(fp * review_cost)
        
        # Total dataset FP cost projection
        total_fp_projected = int(fp * (len(df) / len(df_test)))
        total_fp_cost_projected = float(total_fp_projected * review_cost)
        
        metrics = {
            'model_type': model_type,
            'train_size': len(X_train),
            'test_size': len(X_test),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'accuracy': round(acc, 4),
            'roc_auc': round(roc_auc, 4),
            'confusion_matrix': {
                'true_positive': tp,
                'true_negative': tn,
                'false_positive': fp,
                'false_negative': fn
            },
            'false_positive_count_test': fp,
            'false_positive_rate': round(fp_rate, 4),
            'review_cost_per_tx': review_cost,
            'false_positive_cost_test': round(fp_cost, 2),
            'total_fp_projected': total_fp_projected,
            'total_fp_cost_projected': round(total_fp_cost_projected, 2)
        }
        
        # Save artifacts
        joblib.dump(self.model, os.path.join(self.data_dir, "model.pkl"))
        joblib.dump(self.encoder, os.path.join(self.data_dir, "encoder.pkl"))
        joblib.dump(self.feature_names, os.path.join(self.data_dir, "feature_names.pkl"))
        joblib.dump(metrics, os.path.join(self.data_dir, "metrics.pkl"))
        
        print("ML Pipeline execution successful.")
        print(f"Metrics: Precision={prec:.2%}, Recall={rec:.2%}, F1={f1:.2%}, ROC-AUC={roc_auc:.4f}")
        print(f"False Positives in Test Set: {fp} (Cost: Rs. {fp_cost:,.2f} @ Rs. {review_cost}/review)")
        
        return df, metrics

    def predict_one(self, tx_dict):
        """
        Predict probability for a single transaction dictionary.
        """
        df_single = pd.DataFrame([tx_dict])
        
        # Ensure all columns present
        for col in NUMERICAL_FEATURES + CATEGORICAL_FEATURES:
            if col not in df_single.columns:
                if col in NUMERICAL_FEATURES:
                    df_single[col] = 0
                else:
                    df_single[col] = 'UPI' if col == 'payment_method' else 'ecommerce'
                    
        X_single = self.preprocess(df_single, is_training=False)
        prob = float(self.model.predict_proba(X_single)[0, 1])
        return prob

if __name__ == '__main__':
    pipeline = MLPipeline()
    pipeline.train_and_evaluate(10000)
