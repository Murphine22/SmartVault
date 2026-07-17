# SmartVault: Full-Stack Document Management System

Welcome to SmartVault, a premium, secure, and visually stunning Full-Stack Document Management System. SmartVault is built with a modern tech stack (React, Node.js, Express, MongoDB) and boasts an elegant, glassmorphic UI design crafted purely with Vanilla CSS.

## 🌟 Features

- **High-End UI/UX**: Custom-designed dark mode interface with glassmorphism, glowing accents, and smooth micro-animations to ensure a breathtaking user experience.
- **Dual Authentication**: Support for custom local authentication (JWT & bcrypt) AND Auth0 integration for enterprise-level security.
- **Cloud Storage Integration**: Direct document and media uploads to Cloudinary.
- **Comprehensive Document Management**: Complete CRUD capabilities for documents, including metadata categorization (tags, departments, etc.).
- **Advanced Search & Filtering**: Instantly find documents by title, tag, or category.
- **Document Sharing**: Generate share links and manage access levels (public/private/shared).
- **Storage Analytics**: A gorgeous dashboard displaying total storage usage and category distribution.
- **Activity Log**: Keep track of who viewed, uploaded, or edited documents.
- **Trash & Restore**: Soft-delete items to a trash bin and restore them when needed.

## 🛠️ Technology Stack

- **Frontend**: React, Vite, React Router, Axios, Lucide React (Icons), Vanilla CSS (Custom Variables, Flex/Grid, Keyframes).
- **Backend**: Node.js, Express, Mongoose, MongoDB.
- **Authentication**: JWT, bcryptjs, @auth0/auth0-react.
- **File Management**: Multer, Cloudinary SDK.

## 🚀 Setup Guide

### 1. Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local instance or MongoDB Atlas)
- Cloudinary Account (for file storage)
- (Optional) Auth0 Account (if you intend to use Auth0)

### 2. Clone the Repository
```bash
git clone https://github.com/Murphine22/SmartVault.git
cd SmartVault
```

### 3. Environment Variables
Create a `.env` file in the `server` directory and configure the following variables (you can use the provided `.env.example` as a template):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartvault
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Auth0 Configuration (Optional, frontend handles client ID)
AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_AUDIENCE=your_auth0_audience
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
```

### 4. Installation
Install dependencies for both the server and the client from the root directory:
```bash
npm run install-all
```

### 5. Running the Application
Start both the backend server and frontend client concurrently:
```bash
npm run dev
```

- **Client**: `http://localhost:5173`
- **Server**: `http://localhost:5000`

---

## 🎨 Design Philosophy
SmartVault strictly utilizes **Vanilla CSS** with a robust CSS Variable system to bypass UI framework bloat. It incorporates emotional triggers and pattern interruptions (like dynamic color shifts on storage limits and satisfying micro-interactions on file uploads) to maximize user engagement. 

Enjoy exploring SmartVault!
