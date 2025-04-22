import warnings
from datetime import datetime, timedelta

import gradio as gr
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

warnings.filterwarnings('ignore')

class RestaurantSalesPrediction:
    def __init__(self):
        self.encoders = {}
        self.scaler = StandardScaler()
        self.models = {}
        self.feature_columns = None
        
    def preprocess_data(self, csv_path):
        """Preprocess the data with minimal required features"""
        df = pd.read_csv(csv_path)
        
        # Convert date with proper format and error handling
        try:
            df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y')
        except ValueError:
            print("Attempting alternative date format...")
            df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
            
        # Convert time to hour
        df['time'] = pd.to_datetime(df['time'], format='%H:%M:%S', errors='coerce').dt.time
        df['hour'] = df['time'].apply(lambda x: x.hour if x else 0)
        
        # Create basic temporal features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        
        # Handle item_name encoding
        if 'item_name' in df.columns:
            df['item_name'] = df['item_name'].fillna('Unknown')
            self.encoders['item_name'] = LabelEncoder()
            self.encoders['item_name'].fit(df['item_name'].unique())
            df['item_name'] = self.encoders['item_name'].transform(df['item_name'])
        
        return df
    
    def prepare_features(self, df):
        """Prepare minimal feature matrix"""
        if self.feature_columns is None:
            self.feature_columns = ['hour', 'day_of_week', 'month']
        
        return df[self.feature_columns]
    
    def train_models(self, df):
        """Train models for each item"""
        unique_items = df['item_name'].unique()
        
        print("\nTraining models for each item...")
        for item_code in unique_items:
            try:
                item_name = self.encoders['item_name'].inverse_transform([item_code])[0]
                print(f"Training model for: {item_name}")
                
                item_data = df[df['item_name'] == item_code].copy()
                X = self.prepare_features(item_data)
                y = item_data['quantity']
                
                if len(y) < 2:
                    print(f"Skipping {item_name} - insufficient data")
                    continue
                
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42
                )
                
                X_train_scaled = self.scaler.fit_transform(X_train)
                X_test_scaled = self.scaler.transform(X_test)
                
                model = RandomForestRegressor(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
                model.fit(X_train_scaled, y_train)
                
                self.models[str(item_code)] = {
                    'model': model,
                    'scaler': StandardScaler().fit(X),
                    'metrics': self.evaluate_model(model, X_test_scaled, y_test)
                }
            except Exception as e:
                print(f"Error training model for item {item_code}: {str(e)}")
                continue

    def predict_future_sales(self, start_date, num_days):
        """Predict total sales for the specified number of days"""
        try:
            # Generate basic future dates structure
            dates = pd.date_range(start=start_date, periods=num_days, freq='D')
            future_data = []
            
            for date in dates:
                for hour in range(8, 23, 2):  # Operating hours
                    future_data.append({
                        'hour': hour,
                        'day_of_week': date.dayofweek,
                        'month': date.month
                    })
            
            future_df = pd.DataFrame(future_data)
            predictions = {}
            
            for item_code, model_info in self.models.items():
                try:
                    X_future = future_df[self.feature_columns]
                    X_future_scaled = model_info['scaler'].transform(X_future)
                    total_prediction = int(round(model_info['model'].predict(X_future_scaled).sum()))
                    
                    # Get the original item name
                    item_name = self.encoders['item_name'].inverse_transform([int(item_code)])[0]
                    predictions[item_name] = total_prediction
                except Exception as e:
                    print(f"Error predicting for item {item_code}: {str(e)}")
                    continue
            
            # Format the predictions with additional metadata
            formatted_predictions = {
                "metadata": {
                    "prediction_period": f"{num_days} days",
                    "start_date": start_date.strftime('%Y-%m-%d'),
                    "end_date": (start_date + timedelta(days=num_days-1)).strftime('%Y-%m-%d')
                },
                "predictions": {
                    str(k): int(v) for k, v in predictions.items()
                }
            }
            
            return formatted_predictions
        except Exception as e:
            print(f"Error in predictions: {str(e)}")
            return {"error": str(e)}

    def evaluate_model(self, model, X_test, y_test):
        """Evaluate model performance"""
        try:
            predictions = model.predict(X_test)
            return {
                'mae': float(mean_absolute_error(y_test, predictions)),
                'rmse': float(np.sqrt(mean_squared_error(y_test, predictions))),
                'r2': float(r2_score(y_test, predictions))
            }
        except Exception as e:
            print(f"Error in model evaluation: {str(e)}")
            return {'mae': np.nan, 'rmse': np.nan, 'r2': np.nan}

def run_prediction(csv_file, num_days):
    try:
        # Validate input
        num_days = int(num_days)
        if num_days <= 0:
            return {"error": "Number of days must be greater than 0"}
        if num_days > 365:
            return {"error": "Prediction period cannot exceed 365 days"}
            
        predictor = RestaurantSalesPrediction()
        
        # Preprocess data
        processed_data = predictor.preprocess_data(csv_file.name)
        
        # Train models
        predictor.train_models(processed_data)
        
        # Predict future sales
        last_date = processed_data['date'].max()
        predictions = predictor.predict_future_sales(last_date + timedelta(days=1), num_days)
        
        return predictions
    except ValueError:
        return {"error": "Invalid number of days. Please enter a valid number."}
    except Exception as e:
        return {"error": str(e)}

# Gradio Interface
iface = gr.Interface(
    fn=run_prediction,
    inputs=[
        gr.File(label="Upload CSV File"),
        gr.Number(label="Number of Days to Predict", 
                 value=30,  # Default value
                 minimum=1,
                 maximum=365,
                 step=1,
                 info="Enter the number of days (1-365) for prediction")
    ],
    outputs=gr.JSON(label="Predictions"),
    title="Restaurant Sales Prediction",
    description="Upload a CSV file containing restaurant sales data and specify the number of days to predict future sales."
)

if __name__ == "__main__":
    iface.launch()