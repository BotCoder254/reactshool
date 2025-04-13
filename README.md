# School Management System

A modern school management system built with React, Firebase, and Tailwind CSS. The system provides a platform for teachers and students to manage classes, assignments, and track progress.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔒 Authentication with Firebase (Email/Password and Google Sign-in)
- 👥 Role-based access (Teachers and Students)
- 📱 Responsive design
- ✨ Smooth animations with Framer Motion
- 🔄 State management with Zustand
- 💾 Offline data persistence with Firestore
- 📊 Analytics integration
- 🗄️ Real-time database support
- 📁 File storage capabilities

## Tech Stack

- React
- Firebase
  - Authentication
  - Firestore (with offline persistence)
  - Realtime Database
  - Storage
  - Analytics
- Tailwind CSS
- Framer Motion
- React Icons
- Zustand
- React Router DOM

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd school-management-system
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. The Firebase configuration is already set up in `src/firebase/config.js`. If you want to use your own Firebase project, replace the configuration object with your own credentials.

4. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   └── ResetPassword.js
│   └── LandingPage/
│       ├── Hero.js
│       ├── Features.js
│       └── Stats.js
├── firebase/
│   └── config.js (Firebase configuration and service initialization)
├── store/
│   └── authStore.js
├── App.js
├── index.js
└── index.css
```

## Firebase Features

The application uses several Firebase services:

1. **Authentication**: Email/Password and Google Sign-in
2. **Firestore**: Main database with offline persistence enabled
3. **Realtime Database**: For real-time features
4. **Storage**: For file uploads and management
5. **Analytics**: For tracking user behavior and app usage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
