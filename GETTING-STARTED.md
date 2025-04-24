# Getting Started Guide

This guide will help you get the Thought & Word of the Day Generator up and running, along with examples of how to use both features.

## Quick Start

1. **Clone the repository**
   ```
   git clone https://github.com/ashmita41/thought-of-the-day-generator.git
   cd thought-and-word-of-the-day-generator
   ```

2. **Set up environment variables**
   ```
   cp .env.example .env          # Root folder
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Install dependencies**
   ```
   npm run install:all
   ```

4. **Start the application**
   ```
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Using the Application

### Thought of the Day Feature

1. **Select "Thought of the Day" content type** from the toggle at the top of the application.

2. **Choose design mode**
   - **Random Design**: Selects a random design configuration for each image.
   - **Fixed Design**: Each day of the week has a specific design. Select the day from the dropdown menu.

3. **Generate Thought Image**
   - Click the "Generate Thought Image" button to create a new image with an inspirational quote.
   - The image is automatically displayed in the preview panel.

4. **Download the Image**
   - Click the "Download Image" button below the preview.
   - The image is saved as "thought-of-the-day.png" to your downloads folder.

### Word of the Day Feature

1. **Select "Word of the Day" content type** from the toggle at the top of the application.

2. **Choose design mode** (same options as Thought of the Day)
   - **Random Design**: Selects a random design configuration for each image.
   - **Fixed Design**: Each day of the week has a specific design. Select the day from the dropdown menu.

3. **Generate Word Image**
   - Click the "Generate Word Image" button to create a new image with an educational word.
   - The image is automatically displayed in the preview panel.
   - The word data includes:
     - Pronunciation
     - Part of speech
     - Definition
     - Example usage

4. **Download the Image**
   - Click the "Download Image" button below the preview.
   - The image is saved as "word-of-the-day.png" to your downloads folder.

## API Examples

### Thought of the Day API

Fetch a random thought/quote:
```
GET http://localhost:3005/quotes/random
```

Response:
```json
{
  "id": "c2ef4983-87f0-4cff-b681-09e3fe87cb6e",
  "text": "The best way to predict the future is to create it.",
  "author": "Abraham Lincoln",
  "source": "quotable",
  "lastUsedAt": "2023-04-22T15:26:41.054Z",
  "usageCount": 1,
  "createdAt": "2023-04-20T15:26:41.054Z",
  "category": "inspiration"
}
```

Generate a thought image:
```
GET http://localhost:3005/image/quote-image?mode=random
```

Response:
```json
{
  "imageUrl": "/generated-images/thoughts/2023-04-22_15-32-47-123.png"
}
```

### Word of the Day API

Fetch the word of the day:
```
GET http://localhost:3005/word/of-the-day
```

Response:
```json
{
  "word": "Serendipity",
  "phonetic": "/ˌsɛrənˈdɪpɪti/",
  "partOfSpeech": "noun",
  "definition": "The occurrence and development of events by chance in a happy or beneficial way",
  "example": "Finding that rare book while looking for something else was pure serendipity.",
  "synonyms": ["chance", "fate", "luck", "providence", "fortuity"]
}
```

Generate a word image:
```
GET http://localhost:3005/image/word-image?mode=fixed&day=monday
```

Response:
```json
{
  "imageUrl": "/generated-images/words/2023-04-22_15-35-12-789.png"
}
```

## Troubleshooting

If you encounter any issues:

1. **Backend fails to start**
   - Check if the database is running and accessible
   - Verify that all required environment variables are set correctly

2. **Frontend fails to connect to backend**
   - Ensure the backend is running on port 3005
   - Check that `REACT_APP_API_URL` is set correctly in your frontend `.env` file

3. **Image generation fails**
   - Ensure the `generated-images` directory exists and is writable
   - Check if both the `words` and `thoughts` subdirectories exist

4. **API calls returning errors**
   - For Word of the Day API errors, verify your Merriam-Webster API keys
   - For database-related errors, check your database connection 