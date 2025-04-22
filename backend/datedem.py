import json
import warnings
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple

import gradio as gr
import numpy as np
import pandas as pd
import requests
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

warnings.filterwarnings('ignore')

# API Configuration
OPENWEATHER_API_KEY = "6024d8f26b0fde2f457c25ad66f4ddbd"
CALENDARIFIC_API_KEY = "KK2xlWOfHqUFF79qZkMO0pH9GjghjMjl"
CITY = "Mumbai"
COUNTRY = "IN"

def get_indian_season(month: int) -> str:
    """Determine Indian season based on month"""
    if month in [3, 4, 5]:
        return 'Summer'
    elif month in [6, 7, 8, 9]:
        return 'Monsoon'
    elif month in [10, 11]:
        return 'Post-Monsoon'
    else:  # months 12, 1, 2
        return 'Winter'

class WeatherService:
    """Service to handle weather data retrieval and processing"""
    
    def __init__(self, api_key: str, city: str):
        self.api_key = api_key
        self.city = city
        self.base_url = "http://api.openweathermap.org/data/2.5/forecast"
        
    def get_weather(self, date: datetime) -> Dict[str, Any]:
        """Get weather forecast for a specific date"""
        try:
            params = {
                'q': self.city,
                'appid': self.api_key,
                'units': 'metric'
            }
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            
            weather_data = response.json()
            target_timestamp = date.timestamp()
            closest_forecast = min(
                weather_data['list'],
                key=lambda x: abs(x['dt'] - target_timestamp)
            )
            
            return {
                'temperature': closest_forecast['main']['temp'],
                'humidity': closest_forecast['main']['humidity'],
                'weather_main': closest_forecast['weather'][0]['main'],
                'weather_description': closest_forecast['weather'][0]['description']
            }
        except Exception as e:
            print(f"Error fetching weather data: {str(e)}")
            return {
                'temperature': None,
                'humidity': None,
                'weather_main': None,
                'weather_description': None
            }

    def get_weather_score(self, weather_data: Dict[str, Any]) -> float:
        """Calculate weather score based on conditions"""
        if not weather_data['weather_main']:
            return 1.0

        weather_impacts = {
            'Clear': 1.1,    # Good weather boost
            'Clouds': 1.0,   # Neutral
            'Rain': 0.85,    # Significant reduction
            'Thunderstorm': 0.7,  # Major reduction
            'Snow': 0.6,     # Major reduction
            'Mist': 0.95,    # Minor reduction
            'Haze': 0.95     # Minor reduction
        }
        
        return weather_impacts.get(weather_data['weather_main'], 1.0)

class HolidayService:
    """Service to handle holiday checking"""
    
    def __init__(self, api_key: str, country: str):
        self.api_key = api_key
        self.country = country
        self.base_url = "https://calendarific.com/api/v2/holidays"
        self.holiday_cache = {}
        
    def get_holidays(self, year: int) -> list:
        """Get holidays for a specific year"""
        if year in self.holiday_cache:
            return self.holiday_cache[year]
            
        try:
            params = {
                'api_key': self.api_key,
                'country': self.country,
                'year': year
            }
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            
            holidays = response.json()['response']['holidays']
            self.holiday_cache[year] = holidays
            return holidays
        except Exception as e:
            print(f"Error fetching holiday data: {str(e)}")
            return []
    
    def is_holiday(self, date: datetime) -> Tuple[bool, Optional[str], float]:
        """Check if a specific date is a holiday and return importance factor"""
        holidays = self.get_holidays(date.year)
        date_str = date.strftime('%Y-%m-%d')
        
        for holiday in holidays:
            if holiday['date']['iso'] == date_str:
                if holiday.get('type', [''])[0] in ['National holiday', 'Major holiday']:
                    return True, holiday['name'], 1.3  # Major holiday boost
                return True, holiday['name'], 1.15  # Minor holiday boost
        return False, None, 1.0

class SeasonEncoder:
    """Custom encoder for handling seasons"""
    def __init__(self):
        self.season_mapping = {
            'Summer': 0,
            'Monsoon': 1,
            'Post-Monsoon': 2,
            'Winter': 3
        }
        
    def transform(self, seasons):
        return [self.season_mapping[season] for season in seasons]
    
    def inverse_transform(self, encoded_seasons):
        inverse_mapping = {v: k for k, v in self.season_mapping.items()}
        return [inverse_mapping[code] for code in encoded_seasons]

class DailySalesPrediction:
    """Main class for sales prediction"""
    
    def __init__(self, weather_service: WeatherService, holiday_service: HolidayService):
        self.weather_service = weather_service
        self.holiday_service = holiday_service
        self.encoders = {'season': SeasonEncoder()}  # Use custom season encoder
        self.scaler = StandardScaler()
        self.models = {}
        
    def preprocess_data(self, csv_path: str) -> pd.DataFrame:
        """Preprocess the input data with enhanced features"""
        df = pd.read_csv(csv_path)
        
        # Convert date
        try:
            df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y')
        except ValueError:
            df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
        
        # Extract and encode time features
        df['is_weekend'] = df['date'].dt.dayofweek.isin([5, 6]).astype(int)
        df['month'] = df['date'].dt.month
        df['day_of_week'] = df['date'].dt.dayofweek
        
        # Add season using custom encoder
        df['season'] = df['month'].apply(get_indian_season)
        df['season'] = self.encoders['season'].transform(df['season'])
        
        # Handle item encoding
        if 'item_name' in df.columns:
            df['item_name'] = df['item_name'].fillna('Unknown')
            self.encoders['item_name'] = LabelEncoder()
            df['item_name'] = self.encoders['item_name'].fit_transform(df['item_name'])
        
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare enhanced feature matrix"""
        feature_columns = [
            'is_weekend',
            'month',
            'day_of_week',
            'season'
        ]
        return df[feature_columns]
    
    def train_models(self, df: pd.DataFrame) -> None:
        """Train prediction models with enhanced features"""
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
                    n_estimators=200,
                    max_depth=15,
                    min_samples_split=5,
                    min_samples_leaf=2,
                    random_state=42
                )
                model.fit(X_train_scaled, y_train)
                
                self.models[str(item_code)] = {
                    'model': model,
                    'scaler': self.scaler,
                    'metrics': self._evaluate_model(model, X_test_scaled, y_test)
                }
            except Exception as e:
                print(f"Error training model for item {item_code}: {str(e)}")
    
    def predict_for_date(self, date: datetime) -> Dict[str, Any]:
        """Predict sales with enhanced seasonal and environmental factors"""
        try:
            weather_data = self.weather_service.get_weather(date)
            is_holiday, holiday_name, holiday_factor = self.holiday_service.is_holiday(date)
            weather_factor = self.weather_service.get_weather_score(weather_data)
            
            # Get season and convert using custom encoder
            season = get_indian_season(date.month)
            season_encoded = self.encoders['season'].transform([season])[0]
            
            # Prepare features for prediction
            features = pd.DataFrame({
                'is_weekend': [1 if date.weekday() in [5, 6] else 0],
                'month': [date.month],
                'day_of_week': [date.weekday()],
                'season': [season_encoded]
            })
            
            predictions = {}
            for item_code, model_info in self.models.items():
                try:
                    X_scaled = model_info['scaler'].transform(features)
                    base_prediction = model_info['model'].predict(X_scaled)[0]
                    
                    # Apply seasonal adjustments
                    season_factors = {
                        'Summer': 1.1,
                        'Monsoon': 0.9,
                        'Post-Monsoon': 1.0,
                        'Winter': 1.05
                    }
                    season_factor = season_factors[season]
                    
                    # Weekend factor
                    weekend_factor = 1.2 if date.weekday() in [5, 6] else 1.0
                    
                    # Calculate final prediction with all factors
                    final_prediction = base_prediction * (
                        season_factor *
                        weather_factor *
                        holiday_factor *
                        weekend_factor
                    )
                    
                    item_name = self.encoders['item_name'].inverse_transform([int(item_code)])[0]
                    predictions[item_name] = int(round(final_prediction))
                except Exception as e:
                    print(f"Error predicting for item {item_code}: {str(e)}")
            
            return {
                "metadata": {
                    "date": date.strftime('%Y-%m-%d'),
                    "season": season,
                    "is_weekend": date.weekday() in [5, 6],
                    "is_holiday": is_holiday,
                    "holiday_name": holiday_name,
                    "weather": weather_data,
                    "adjustment_factors": {
                        "season_factor": season_factor,
                        "weather_factor": weather_factor,
                        "holiday_factor": holiday_factor,
                        "weekend_factor": weekend_factor
                    }
                },
                "predictions": predictions
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _evaluate_model(self, model, X_test, y_test):
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

def predict_sales(csv_file, prediction_date):
    try:
        weather_service = WeatherService(OPENWEATHER_API_KEY, CITY)
        holiday_service = HolidayService(CALENDARIFIC_API_KEY, COUNTRY)
        predictor = DailySalesPrediction(weather_service, holiday_service)
        
        pred_date = datetime.strptime(prediction_date, '%Y-%m-%d')
        
        processed_data = predictor.preprocess_data(csv_file.name)
        predictor.train_models(processed_data)
        
        predictions = predictor.predict_for_date(pred_date)
        
        return predictions
    except Exception as e:
        return {"error": str(e)}

# Gradio Interface
iface = gr.Interface(
    fn=predict_sales,
    inputs=[
        gr.File(label="Upload Sales History CSV"),
        gr.Textbox(label="Prediction Date (YYYY-MM-DD)", 
                  placeholder="2024-10-27")
    ],
    outputs=gr.JSON(label="Predictions"),
    title="Daily Sales Prediction with Seasonal Factors",
    description="Upload your sales history and select a date to get predictions considering Indian seasons, weather, holidays, and weekends."
)

if __name__ == "__main__":
    iface.launch()