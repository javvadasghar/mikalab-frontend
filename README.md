# MIKA Lab Web Frontend

## 🚀 Features

- **User Authentication**

  - Secure login and registration
  - JWT-based session management
  - Persistent authentication state

- **Dashboard**

  - View all scenarios
  - Real-time search and filtering
  - Video status tracking
  - Quick actions (Edit, Download, Delete)

- **Scenario Management**

  - Create multi-stop training scenarios
  - Edit existing scenarios
  - Define stop details (name, stay duration, travel time)
  - Add emergency situations

- **Video Management**

  - Download generated videos
  - Automatic file naming

- **Admin Panel**

  - User management interface
  - Create, edit, and delete users
  - Promote users to admin role
  - View all system users

- **Modern UI/UX**
  - Responsive design
  - Beautiful modals and notifications
  - Smooth animations
  - Intuitive navigation

## Prerequisites

Before running the frontend, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MIKA Backend** running on `http://localhost:5000`

## 🛠️ Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd mikalab-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React
- React Router
- Bootstrap
- Testing libraries

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory of the frontend project:

```bash
# .env file is required to configure backend API connection

# Suppress Node.js deprecation warnings (optional)
NODE_OPTIONS=--no-deprecation
```

**Note:** While the `.env` file is currently used for Node options, ensure your backend API URL is correctly configured in `src/config.js`. The backend must be running and accessible for the frontend to function properly.

### Step 4: Configure Backend Connection

Update the `src/config.js` file with your backend API URL:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Ensure this matches your backend server address.

### Step 5: Start the Development Server

```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

**Development Server Features:**
- Hot reloading enabled
- Automatic compilation on file changes
- ESLint warnings displayed in console

### Step 6: Verify Backend Connection

Make sure your backend server is running before using the frontend:

```bash
# In a separate terminal, navigate to backend directory
cd mikalab
npm start
```

The backend should be running on `http://localhost:5000`

## 📝 Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)


## 🔧 Configuration

### Backend API Configuration

Edit `src/config.js` to change the backend API endpoint:

```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
```

### Database Connection

**Important:** The backend requires a `.env` file with database configuration:

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mikalab
PORT=5000
JWT_SECRET=your_secret_key
```

Ensure the backend `.env` file is properly configured before starting the frontend application.

## 🌐 Accessing the Application

Once the development server is running:

1. Open your browser and navigate to `http://localhost:3000`
2. You'll be redirected to the login page
3. Log in with your credentials
4. Start managing scenarios and videos!

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use, you'll be prompted to use a different port (usually 3001)

### Backend Connection Issues

- Verify backend is running on the correct port
- Check `src/config.js` has the correct API URL
- Ensure backend `.env` file has proper database credentials
- Check network/firewall settings

### Installation Errors

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```
