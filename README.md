# Thought of the Day Generator 🎨✨

Automatically generate beautiful "Thought of the Day" images with dynamic quotes and customizable designs. Built with NestJS (Backend) and React (Frontend).

![Demo Screenshot](/public/screenshots/demo.png)  
*Example output with fixed design and quote*

## 🚀 Features
- **Dynamic Quote Fetching**: From Quotable/ZenQuotes APIs.
- **Two Design Modes**: 
  - Fixed (day-specific designs) 
  - Random (randomly generated layouts)
- **Auto-Text Wrapping**: Smart font scaling for optimal readability.
- **Downloadable Images**: Save generated quotes as PNG files.

## 🛠 Tech Stack
### Backend (NestJS)
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (quote storage)
- **Image Generation**: node-canvas
- **APIs**: Quotable, ZenQuotes

### Frontend (React)
- **UI Framework**: React.js
- **Styling**: Tailwind CSS

## 🌐 API Documentation
### Base URL: `http://localhost:3001/api`

### **Quote Endpoints**
| Endpoint              | Method | Description                          |
|-----------------------|--------|--------------------------------------|
| `/quotes/random`      | GET    | Fetch a random unused quote          |
| `/quotes/debug`       | GET    | Debug: list all quotes (dev-only)    |

**Example Request**:
```bash
curl http://localhost:3001/quotes/random
```

**Response**:
```json
{
  "id": "c2ef4983-87f0-4cff-b681-09e3fe87cb6e",
  "text": "Loving thoughts and actions are clearly beneficial for our physical and mental health.",
  "author": "Dalai Lama",
  "source": "zen-quotes",
  "lastUsedAt": "2025-04-05T05:02:33.235Z",
  "usageCount": 0,
  "createdAt": "2025-03-30T15:26:41.054Z",
  "category": null
}
```

### **Design Endpoints**
| Endpoint              | Method | Description                          |
|-----------------------|--------|--------------------------------------|
| `/design/random`      | GET    | Get random design config             |
| `/design/fixed/Monday`| GET    | Get fixed design for Monday          |

**Example Request**:
```bash
curl http://localhost:3001/design/random
```

### **Image Endpoints**
| Endpoint              | Method | Description                          |
|-----------------------|--------|--------------------------------------|
| `/image/quote-image`  | GET    | Generate quote image                 |

**Query Params**:
```
mode: fixed or random (required)
day: Day name (required if mode=fixed)
```

**Example Request**:
```bash
curl "http://localhost:3001/api/image/quote-image?mode=fixed&day=Monday"
```

**Response**:
```json
{ "imageUrl": "/public/images/quote_123.png" }
```

## 🧩 Architecture
The application follows a modular architecture with clear separation of concerns:

- **Frontend Layer**: React UI for generating and downloading images
- **Backend Layer**: NestJS RESTful API endpoints
- **Business Logic Layer**: Services for quotes, design, and image generation
- **Database Layer**: PostgreSQL storage for quotes and metadata
- **Canvas Rendering Layer**: node-canvas for dynamic image generation
- **Storage Layer**: Generated images saved to the file system

## 🏗️ Setup
### Backend
Configure Environment:
```bash
cd backend
cp .env.example .env  # Update PostgreSQL credentials
```

Install & Run:
```bash
npm install
npm run start:dev
```

### Frontend
Set API URL:
```bash
cd frontend
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
```

Install & Run:
```bash
npm install
npm start
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔮 Future Enhancements
- Add Word of the Day generation
- Implement user authentication and scheduling
- Allow users to upload custom fonts and themes
- Provide social media auto-posting feature
- Add quote categories and filtering
- Implement custom background image uploads
- Add analytics for quote popularity

## 📞 Contact
Ashmita - [@x](https://x.com/ashmita41) - [@Linkedin](https://www.linkedin.com/in/ashmita47/) - ashmitapandey47@gmail.com

Project Link: [https://github.com/ashmita41/thought-of-the-day-generator](https://github.com/ashmita41/thought-of-the-day-generator)
