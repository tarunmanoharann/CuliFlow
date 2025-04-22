import json
import warnings
from datetime import datetime, timedelta

import gradio as gr
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

warnings.filterwarnings('ignore')

class EnhancedSalesPrediction:
    def __init__(self):
        self.encoders = {}
        self.scaler = StandardScaler()
        self.models = {}
        self.feature_columns = None
        self.performance_metrics = {}
        
    def preprocess_data(self, df):
        """Preprocess the data with minimal required features"""
        try:
            df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y')
        except ValueError:
            df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
            
        df['time'] = pd.to_datetime(df['time'], format='%H:%M:%S', errors='coerce').dt.time
        df['hour'] = df['time'].apply(lambda x: x.hour if x else 0)
        
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        
        if 'item_name' in df.columns:
            df['item_name'] = df['item_name'].fillna('Unknown')
            self.encoders['item_name'] = LabelEncoder()
            self.encoders['item_name'].fit(df['item_name'].unique())
            df['item_name'] = self.encoders['item_name'].transform(df['item_name'])
        
        return df
    
    def prepare_features(self, df):
        if self.feature_columns is None:
            self.feature_columns = ['hour', 'day_of_week', 'month']
        return df[self.feature_columns]
    
    def calculate_time_based_metrics(self, actual, predicted, dates):
        """Calculate metrics for different time periods"""
        df = pd.DataFrame({
            'date': pd.to_datetime(dates),
            'actual': actual,
            'predicted': predicted
        })
        
        # Daily aggregation
        daily = df.groupby(df['date'].dt.strftime('%Y-%m-%d')).agg({
            'actual': 'sum',
            'predicted': 'sum'
        })
        
        # Weekly aggregation
        df['week'] = df['date'].dt.strftime('%Y-%W')
        weekly = df.groupby('week').agg({
            'actual': 'sum',
            'predicted': 'sum'
        })
        
        # Monthly aggregation
        df['month'] = df['date'].dt.strftime('%Y-%m')
        monthly = df.groupby('month').agg({
            'actual': 'sum',
            'predicted': 'sum'
        })
        
        metrics = {
            'daily': self.calculate_metrics(daily['actual'], daily['predicted']),
            'weekly': self.calculate_metrics(weekly['actual'], weekly['predicted']),
            'monthly': self.calculate_metrics(monthly['actual'], monthly['predicted']),
            'overall': self.calculate_metrics(actual, predicted)
        }
        
        return metrics
    
    def calculate_metrics(self, actual, predicted):
        """Calculate performance metrics"""
        metrics = {
            'mae': float(mean_absolute_error(actual, predicted)),
            'rmse': float(np.sqrt(mean_squared_error(actual, predicted))),
            'r2': float(r2_score(actual, predicted)),
            'mape': float(np.mean(np.abs((actual - predicted) / np.where(actual == 0, 1, actual))) * 100)
        }
        return {k: round(v, 3) for k, v in metrics.items()}
    
    def create_performance_plots(self, actual, predicted, dates):
        """Create performance visualization"""
        df = pd.DataFrame({
            'date': pd.to_datetime(dates),
            'actual': actual,
            'predicted': predicted
        })
        
        # Create subplots
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Daily Comparison', 'Weekly Comparison', 
                          'Monthly Comparison', 'Actual vs Predicted'),
            vertical_spacing=0.12
        )
        
        # Daily plot
        daily = df.groupby(df['date'].dt.strftime('%Y-%m-%d')).agg({
            'actual': 'sum',
            'predicted': 'sum'
        })
        fig.add_trace(
            go.Scatter(x=daily.index, y=daily['actual'],
                      name='Actual (Daily)', line=dict(color='blue')),
            row=1, col=1
        )
        fig.add_trace(
            go.Scatter(x=daily.index, y=daily['predicted'],
                      name='Predicted (Daily)', line=dict(color='red')),
            row=1, col=1
        )
        
        # Weekly plot
        df['week'] = df['date'].dt.strftime('%Y-%W')
        weekly = df.groupby('week').agg({
            'actual': 'sum',
            'predicted': 'sum'
        })
        fig.add_trace(
            go.Scatter(x=weekly.index, y=weekly['actual'],
                      name='Actual (Weekly)', line=dict(color='blue')),
            row=1, col=2
        )
        fig.add_trace(
            go.Scatter(x=weekly.index, y=weekly['predicted'],
                      name='Predicted (Weekly)', line=dict(color='red')),
            row=1, col=2
        )
        
        # Monthly plot
        df['month'] = df['date'].dt.strftime('%Y-%m')
        monthly = df.groupby('month').agg({
            'actual': 'sum',
            'predicted': 'sum'
        })
        fig.add_trace(
            go.Scatter(x=monthly.index, y=monthly['actual'],
                      name='Actual (Monthly)', line=dict(color='blue')),
            row=2, col=1
        )
        fig.add_trace(
            go.Scatter(x=monthly.index, y=monthly['predicted'],
                      name='Predicted (Monthly)', line=dict(color='red')),
            row=2, col=1
        )
        
        # Scatter plot
        fig.add_trace(
            go.Scatter(x=actual, y=predicted, mode='markers',
                      name='Actual vs Predicted', marker=dict(color='green')),
            row=2, col=2
        )
        
        # Add perfect prediction line
        min_val = min(min(actual), min(predicted))
        max_val = max(max(actual), max(predicted))
        fig.add_trace(
            go.Scatter(x=[min_val, max_val], y=[min_val, max_val],
                      name='Perfect Prediction', line=dict(color='gray', dash='dash')),
            row=2, col=2
        )
        
        fig.update_layout(height=800, showlegend=True, title_text="Performance Analysis")
        return fig
    
    def train_and_evaluate(self, df):
        """Train models and evaluate performance"""
        results = {}
        
        for item_code in df['item_name'].unique():
            item_data = df[df['item_name'] == item_code].copy()
            X = self.prepare_features(item_data)
            y = item_data['quantity']
            
            if len(y) < 2:
                continue
                
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
            model.fit(X_train_scaled, y_train)
            
            y_pred = model.predict(X_test_scaled)
            
            item_name = self.encoders['item_name'].inverse_transform([item_code])[0]
            
            test_dates = item_data.iloc[len(y_train):]['date'].values
            
            # Calculate performance metrics
            metrics = self.calculate_time_based_metrics(
                y_test, 
                y_pred,
                test_dates
            )
            
            # Create performance plots
            plots = self.create_performance_plots(
                y_test,
                y_pred,
                test_dates
            )
            
            results[item_name] = {
                'metrics': metrics,
                'plots': plots
            }
            
        return results

def analyze_sales_performance(csv_file):
    try:
        # Read and validate CSV file
        df = pd.read_csv(csv_file.name)
        required_columns = ['date', 'time', 'item_name', 'quantity']
        if not all(col in df.columns for col in required_columns):
            return {
                "error": f"CSV must contain columns: {', '.join(required_columns)}"
            }
        
        # Initialize and run analysis
        analyzer = EnhancedSalesPrediction()
        processed_data = analyzer.preprocess_data(df)
        results = analyzer.train_and_evaluate(processed_data)
        
        # Format results for display
        formatted_results = {
            "analysis_timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "overall_summary": {},
            "item_performance": {}
        }
        
        for item_name, item_results in results.items():
            formatted_results["item_performance"][item_name] = {
                "daily_metrics": item_results["metrics"]["daily"],
                "weekly_metrics": item_results["metrics"]["weekly"],
                "monthly_metrics": item_results["metrics"]["monthly"],
                "overall_metrics": item_results["metrics"]["overall"]
            }
            
        return formatted_results, results[list(results.keys())[0]]['plots']
        
    except Exception as e:
        return {"error": str(e)}, None

# Gradio Interface
iface = gr.Interface(
    fn=analyze_sales_performance,
    inputs=[
        gr.File(label="Upload Sales Data CSV")
    ],
    outputs=[
        gr.JSON(label="Performance Metrics"),
        gr.Plot(label="Performance Visualization")
    ],
    title="Enhanced Sales Prediction Performance Analysis",
    description="Upload your sales data CSV to get comprehensive performance metrics and visualizations."
)

if __name__ == "__main__":
    iface.launch()