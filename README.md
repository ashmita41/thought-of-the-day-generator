# Thought & Word of the Day Generator 🎨✨

Generate beautiful images with meaningful quotes and interesting vocabulary words. This application provides two main features:

1. **Thought of the Day**: Inspirational quotes with custom designs
2. **Word of the Day**: Educational word content with pronunciation, definition, and examples

## 📸 Demo Screenshots

![Thought of the Day](/public/screenshots/demo-1.png)  
*Example of Thought of the Day with inspirational quote*

![Word of the Day](/public/screenshots/demo-2.png)  
*Example of Word of the Day with vocabulary definition*

## 🚀 Features

### Thought of the Day
- **Dynamic Quote Fetching**: From Quotable/ZenQuotes APIs.
- **Beautiful Designs**: Various layouts, colors, and typography.
- **Auto-Text Wrapping**: Smart font scaling for optimal readability.

### Word of the Day
- **Interesting Vocabulary**: Discover new words with pronunciation.
- **Educational Content**: Definitions, usage examples, and part of speech.
- **Multiple Data Sources**: Uses Merriam-Webster Dictionary APIs with multilevel fallback mechanisms:
  1. Tries multiple free random word APIs in sequence
  2. Retrieves detailed information from Merriam-Webster APIs
  3. Falls back to a database of words if external APIs fail
  4. Includes predefined words as a final fallback
- **Complete Word Information**: Includes phonetic pronunciation, part of speech, definition, and example usage

### Shared Features
- **Two Design Modes**: 
  - Fixed (day-specific designs) 
  - Random (randomly generated layouts)
- **Downloadable Images**: Save generated quotes as PNG files.
- **Mobile-Friendly UI**: Responsive design works on all devices.

## 📖 Documentation

For a complete guide on setting up and using the application, please refer to:

- [Getting Started Guide](GETTING-STARTED.md) - Setup instructions and usage examples
- [Technical Implementation Details](README-TECHNICAL-DETAILS.md) - Comprehensive documentation covering system architecture, algorithms, and advanced features

## 🛠 Tech Stack
### Backend (NestJS)
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (quote and word storage)
- **Image Generation**: node-canvas
- **APIs**: Quotable, ZenQuotes, Merriam-Webster, and Random Word APIs

### Frontend (React)
- **UI Framework**: React.js
- **Styling**: Tailwind CSS

## 🌐 API Documentation
### Base URL: `http://localhost:3005`

### **Quote Endpoints**
| Endpoint              | Method | Description                          |
|-----------------------|--------|--------------------------------------|
| `/quotes/random`      | GET    | Fetch a random unused quote          |
| `/quotes/debug`       | GET    | Debug: list all quotes               |

### **Word Endpoints**
| Endpoint              | Method | Description                          |
|-----------------------|--------|--------------------------------------|
| `/word/of-the-day`    | GET    | Get the word of the day with details |
| `/words`              | GET    | Get a random word from database      |
| `/words/all`          | GET    | Get all words from database          |
| `/words/refresh`      | GET    | Refresh words database               |

### **Design Endpoints**
| Endpoint              | Method | Description                          |
|-----------------------|--------|--------------------------------------|
| `/design/random`      | GET    | Get random design config             |
| `/design/fixed/Monday`| GET    | Get fixed design for Monday          |

### **Image Endpoints**
| Endpoint              | Method | Description                          |
|-----------------------|--------|--------------------------------------|
| `/image/quote-image`  | GET    | Generate thought image               |
| `/image/word-image`   | GET    | Generate word image                  |

**Query Params for image endpoints**:
```
mode: fixed or random (required)
day: Day name (required if mode=fixed)
```

## 🧩 Architecture
The application follows a modular architecture with clear separation of concerns:

- **Frontend Layer**: React UI for generating and downloading images
- **Backend Layer**: NestJS RESTful API endpoints
- **Business Logic Layer**: Services for quotes, words, design, and image generation
- **Database Layer**: PostgreSQL storage for quotes, words, and metadata
- **Canvas Rendering Layer**: node-canvas for dynamic image generation
- **Storage Layer**: Generated images saved to the file system

## 📂 Project Structure

```
├── backend/                       # NestJS backend
│   ├── src/
│   │   ├── main.ts                # Application entry point
│   │   ├── app.module.ts          # Main application module
│   │   ├── quotes/                # Quotes feature module
│   │   │   ├── controllers/       # HTTP request handlers
│   │   │   ├── services/          # Business logic 
│   │   │   ├── dto/               # Data transfer objects
│   │   │   └── entities/          # Database entity models
│   │   ├── words/                 # Words feature module
│   │   │   ├── controllers/       # Word API endpoints
│   │   │   ├── services/          # Word processing logic
│   │   │   │   ├── word.service.ts               # Core word service
│   │   │   │   └── word-image-connector.service.ts # Connects words to images
│   │   │   ├── interfaces/        # TypeScript interfaces
│   │   │   └── entities/          # Database models
│   │   ├── design/                # Design configuration module
│   │   │   ├── services/          # Design generation services
│   │   │   └── configurations/    # Layout presets
│   │   ├── image/                 # Image generation module
│   │   │   ├── services/          # Canvas drawing services
│   │   │   └── controllers/       # Image API endpoints
│   │   └── prisma/                # Database connection and ORM
│   ├── prisma/                    # Database schema and migrations
│   │   ├── schema.prisma          # Database model definitions
│   │   └── migrations/            # Database version changes
│   ├── .env.example               # Example environment variables
│   └── package.json               # Dependencies and scripts
├── frontend/                      # React frontend
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── App.js                 # Main application component
│   │   ├── components/            # Reusable UI components
│   │   │   ├── DesignSelector/    # Design selection UI
│   │   │   ├── Header/            # Application header
│   │   │   └── ImagePreview/      # Generated image display
│   │   ├── services/              # API communication
│   │   └── styles/                # CSS and styling
│   ├── .env.example               # Frontend environment variables
│   └── package.json               # Frontend dependencies
├── generated-images/              # Generated image storage
│   ├── thoughts/                  # Thought of the day images
│   └── words/                     # Word of the day images
├── .env.example                   # Root environment variables
├── package.json                   # Root scripts for running both apps
├── GETTING-STARTED.md             # Detailed setup and usage guide
├── README-TECHNICAL-DETAILS.md    # Comprehensive technical documentation
└── README.md                      # Main documentation
```

## 🏗️ Quick Setup

For detailed setup instructions, see the [Getting Started Guide](GETTING-STARTED.md).

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL database

### Simple Start (using root package.json)
```bash
# Clone the repository
git clone https://github.com/ashmita41/thought-of-the-day-generator.git
cd thought-of-the-day-generator

# Set up environment variables
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Install all dependencies
npm run install:all

# Start both frontend and backend
npm start
```

Then access the application at `http://localhost:3000`

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔮 Future Enhancements
- Implement user authentication and scheduling
- Allow users to upload custom fonts and themes
- Provide social media auto-posting feature
- Add quote and word categories and filtering
- Implement custom background image uploads
- Add analytics for content popularity

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
