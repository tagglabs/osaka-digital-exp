# Osaka Digital Experience

A digital artifacts management system with CMS capabilities.

## Features

- Artifact management with rich content support
- File uploads (images, videos, documents)
- Media gallery management
- RESTful API with TypeScript support
- MongoDB integration
- Local file storage (with future AWS S3 support)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

- Copy `.env.example` to `.env.local`
- Update the variables as needed

3. Start MongoDB:

- Make sure MongoDB is running locally on port 27017
- Or update MONGODB_URI in .env.local to point to your MongoDB instance

4. Run the development servers:

```bash
npm run dev         # Runs both frontend and backend
npm run dev:frontend # Runs only frontend
npm run dev:backend  # Runs only backend
```

## API Endpoints

### Artifacts

```
GET /api/artifacts
- Get all artifacts
- Returns: Array of artifacts

GET /api/artifacts/:id
- Get single artifact
- Returns: Artifact object

POST /api/artifacts
- Create new artifact
- Body: {
    zoneName: string
    nameOfArtifact: string
    briefDescription: string
    sections: Array<{ title: string, content: string }>
    profilePicture?: File
    images?: File[]
    videos?: File[]
    uploads?: File[]
  }

PUT /api/artifacts/:id
- Update artifact
- Body: Same as POST but all fields optional

DELETE /api/artifacts/:id
- Delete artifact and associated files
```

## Development

### Project Structure

```
src/
├── server/           # Backend
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Express middleware
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── services/    # Business logic
├── types/           # Shared TypeScript types
└── client/          # Frontend (React + Vite)
```

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run build:backend` - Build backend only
- `npm run lint` - Run ESLint
- `npm start` - Run production server

## Future Improvements

- AWS S3 integration for file storage
- Image optimization and processing
- Search functionality
- Authentication and authorization
- Rate limiting and security measures
