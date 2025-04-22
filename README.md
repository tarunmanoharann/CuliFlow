# AI-Powered Sales Prediction and Optimization Dashboard for Restaurants

## Overview
This project is an **AI-Powered Sales Prediction and Optimization Dashboard** designed to assist restaurant owners in predicting item-level sales for the next three months. By integrating key external factors such as holidays, weather, and local trends, the dashboard provides insights essential for informed decision-making, optimized inventory management, and efficient resource allocation.

## Features
1. **Sales Data Integration**: Users can upload historical sales data to refine predictions and enhance accuracy.
2. **Impact Analysis Model**: Evaluates the influence of holidays, weather, and local events on sales trends, providing seasonal insights.
3. **Predictive Sales Modeling**: Uses advanced algorithms to forecast item-wise sales based on historical data and external factors.
4. **Performance Scorecard**: Offers daily, weekly, and monthly reports, with detailed accuracy metrics to support ongoing improvements.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Python with Gradio for interactive elements
- **Database**: MySQL
- **Sentiment Analysis**: NLTK VADER for analyzing review sentiments
- **Data Visualization**: Recharts for graphing and insights

## Future Updates
- **Two-Factor Authentication (2FA)**: Adding an extra layer of security.
- **End-to-End Encryption**: Securing all data communications.
- **Review Survey**: Collecting and analyzing customer feedback to further enhance the predictive models.

## Project Structure
├── frontend │ ├── src │ │ ├── components │ │ ├── pages │ │ └── assets │ └── public ├── backend │ ├── demanda.py (Sales Prediction Model) │ ├── analysis │ │ └── sentiment_analysis.py (Sentiment Analysis with VADER) │ └── database │ └── db_setup.sql (Database setup and schema) └── README.md


## Installation and Setup

### Prerequisites
- Node.js and npm (for frontend)
- Python 3.x (for backend)
- MySQL (for database)
