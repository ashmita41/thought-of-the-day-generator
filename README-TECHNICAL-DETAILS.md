# Project Implementation Details

## Overview

This document provides technical details about the implementation of the Thought & Word of the Day Generator application, covering both features and the underlying architecture.

## Core Features

### Thought of the Day
- **Dynamic Quote Fetching**: Retrieves quotes from Quotable and ZenQuotes APIs with fallback mechanisms
- **Deduplication System**: Tracks used quotes to avoid repetition
- **Design Variations**: Multiple layout templates with customized typography and color schemes

### Word of the Day
- **Multilayer Word Retrieval**: Uses multiple data sources with fallback mechanisms:
  1. Tries multiple free random word APIs in sequence
  2. Retrieves detailed information from Merriam-Webster APIs
  3. Falls back to a database of words if external APIs fail
  4. Includes predefined words as a final fallback
- **Rich Word Information**: Includes pronunciation, definitions, examples, and part of speech

## Technical Implementation Details

### Image Generation System

#### Text Wrapping Algorithm
- **Dynamic Text Fitting**: Automatically adjusts font size based on text length
- **Line Breaking Logic**: Implements smart line-breaking that respects:
  - Word boundaries (no mid-word breaks)
  - Maximum width constraints
  - Minimum font size thresholds
- **Variable Text Positioning**: Adjusts vertical positioning based on line count
- **Hyphenation Support**: For longer words that need to break across lines
- **Canvas Measurement**: Pre-renders text to calculate exact dimensions before final rendering

#### Canvas Rendering
- **HTML5 Canvas**: Uses node-canvas for server-side image generation
- **Shadow Effects**: Implements configurable text shadows for readability
- **Multiple Text Blocks**: Handles primary, secondary, and attribution text areas
- **Font Loading**: Dynamically loads custom fonts from files

### Data Management

#### Deduplication System
- **Database Tracking**: Records previously used quotes and words
- **Refresh Logic**: Marks items as unused after a full cycle
- **Uniqueness Checks**: Ensures no repetition within configurable time periods
- **Cache Layer**: In-memory caching for frequently accessed design configurations

#### Persistence Layer
- **PostgreSQL Database**: Stores quotes, words, and usage metadata
- **Repository Pattern**: Abstracts database operations behind service interfaces
- **Data Migration**: Automatic database seeding and migrations

### API Implementation

#### Rate Limiting
- **Request Throttling**: Limits API requests to prevent abuse
- **Tiered Rate Limits**: Different limits for public vs. authenticated routes
- **Header Information**: Returns rate limit status in response headers
- **IP-based Tracking**: Identifies clients by IP for limit enforcement

#### Error Handling
- **Graceful Degradation**: Falls back to alternative data sources when primary sources fail
- **Comprehensive Error Logging**: Detailed logs for debugging and monitoring
- **Client-Friendly Responses**: Structured error responses with helpful messages
- **Circuit Breaker Pattern**: Temporarily disables problematic external APIs
- **Retry Mechanism**: Automatic retries with exponential backoff for transient failures

#### External API Integration
- **Resilient Requests**: Timeout handling and connection pooling
- **Response Validation**: Schema validation for external API responses
- **Cache Layer**: Caches external API responses to reduce load
- **Credential Management**: Secure handling of API keys and credentials

## API Endpoints

### Quote Endpoints

| Endpoint              | Method | Description                          | Rate Limit     |
|-----------------------|--------|--------------------------------------|----------------|
| `/quotes/random`      | GET    | Fetch a random unused quote          | 100/hr         |
| `/quotes/debug`       | GET    | Debug: list all quotes               | 20/hr          |

### Word Endpoints

| Endpoint              | Method | Description                          | Rate Limit     |
|-----------------------|--------|--------------------------------------|----------------|
| `/word/of-the-day`    | GET    | Get the word of the day with details | 100/hr         |
| `/words`              | GET    | Get a random word from database      | 100/hr         |
| `/words/all`          | GET    | Get all words from database          | 20/hr          |
| `/words/refresh`      | GET    | Refresh words database               | 5/hr           |

### Design Endpoints

| Endpoint              | Method | Description                          | Rate Limit     |
|-----------------------|--------|--------------------------------------|----------------|
| `/design/random`      | GET    | Get random design config             | 200/hr         |
| `/design/fixed/Monday`| GET    | Get fixed design for Monday          | 200/hr         |

### Image Endpoints

| Endpoint              | Method | Description                          | Rate Limit     |
|-----------------------|--------|--------------------------------------|----------------|
| `/image/quote-image`  | GET    | Generate thought image               | 50/hr          |
| `/image/word-image`   | GET    | Generate word image                  | 50/hr          |

**Query Parameters for image endpoints**:
```
mode: fixed or random (required)
day: Day name (required if mode=fixed)
```

## Environment Configuration

To set up the application, create a `.env` file with the following variables:

```
# Database configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# API Keys
QUOTABLE_API_URL="https://api.quotable.io"
ZENQUOTES_API_URL="https://zenquotes.io/api"
MERRIAM_WEBSTER_COLLEGIATE_KEY="your-collegiate-api-key"
MERRIAM_WEBSTER_THESAURUS_KEY="your-thesaurus-api-key"

# Rate Limiting
RATE_LIMIT_WINDOW=3600000  # 1 hour in milliseconds
RATE_LIMIT_MAX_REQUESTS=100

# Image Generation
IMAGE_STORAGE_PATH="./generated-images"
```

## Running the Application

1. Start the backend:
   ```
   cd backend
   npm run start:dev
   ```

2. Start the frontend:
   ```
   cd frontend
   npm start
   ```

3. Access the application at `http://localhost:3000`

## Performance Considerations

- **Image Caching**: Generated images are cached to reduce rendering overhead
- **Database Indexing**: Optimized queries for word and quote retrieval
- **Pooled Connections**: Database connection pooling for better performance
- **Resource Monitoring**: Automatic resource usage tracking and logging 