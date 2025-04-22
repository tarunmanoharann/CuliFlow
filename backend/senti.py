import gradio as gr
import pandas as pd
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
import json

# Download VADER lexicon
nltk.download("vader_lexicon")

# Initialize the VADER sentiment analyzer
sid = SentimentIntensityAnalyzer()


def analyze_sentiments(file):
    """
    Process uploaded CSV file and return sentiment analysis results as JSON
    """
    try:
        # Read the CSV file
        df = pd.read_csv(file.name)

        # Verify if 'Review' column exists
        if "Review" not in df.columns:
            return json.dumps({"error": "CSV file must contain a 'Review' column"})

        # Define sentiment analysis function
        def get_sentiment(review_text):
            if pd.isna(review_text):
                return "Unknown"
            sentiment_scores = sid.polarity_scores(str(review_text))
            compound_score = sentiment_scores["compound"]
            if compound_score >= 0.05:
                return "Positive"
            elif compound_score <= -0.05:
                return "Negative"
            else:
                return "Neutral"

        # Apply sentiment analysis
        df["Predicted_Sentiment"] = df["Review"].apply(get_sentiment)

        # Convert to JSON
        output_data = df.to_dict(orient="records")
        return json.dumps(output_data, indent=4)

    except Exception as e:
        return json.dumps({"error": f"An error occurred: {str(e)}"})


# Create Gradio interface
iface = gr.Interface(
    fn=analyze_sentiments,
    inputs=gr.File(label="Upload CSV file with 'Review' column"),
    outputs=gr.JSON(label="Sentiment Analysis Results"),
    title="Review Sentiment Analyzer",
    description="Upload a CSV file containing a 'Review' column to analyze sentiments. Results will be provided in JSON format.",
    examples=[],
    cache_examples=False,
)

# Launch the app
if __name__ == "__main__":
    iface.launch()
