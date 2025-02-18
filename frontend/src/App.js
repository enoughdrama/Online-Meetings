// src/App.js

import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Register from './Register';
import Login from './Login';
import AdminPanel from './AdminPanel';
import TeacherHome from './TeacherHome';
import StudentHome from './StudentHome';
import Meeting from './Meeting';
import PrivateRoute from './PrivateRoute';
import { AuthContext } from './AuthContext';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomePage from './HomePage';
import Navbar from './Navbar';
import Profile from './Profile';
import InvitePage from './InvitePage';
import NotFound from './NotFound';
import ErrorBoundary from './ErrorBoundary';

import TestList from './TestList';
import TestEditor from './TestEditor';
import TestAttempt from './TestAttempt';
import TestResult from './TestResult';
import TestPasswordPrompt from './TestPasswordPrompt';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function getHomePage(role) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  return '/student';
}

function App() {
  const { user } = useContext(AuthContext);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="*" element={<NotFound />} />

        <Route path="/testing" element={<PrivateRoute><TestList /></PrivateRoute>} />

        <Route path="/testing/edit/:id" element={
          <PrivateRoute requiredRoles={['teacher', 'admin']}>
            <TestEditor />
          </PrivateRoute>
        } />

        <Route path="/testing/attempt/:id" element={
          <PrivateRoute requiredRoles={['student']}>
            <TestAttempt />
          </PrivateRoute>
        } />

        <Route path="/testing/password/:id" element={
          <PrivateRoute requiredRoles={['student']}>
            <TestPasswordPrompt />
          </PrivateRoute>
        } />

        <Route path="/testing/result/:testId" element={<TestResult />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={
          <PrivateRoute>
              <Profile />
          </PrivateRoute>} />
        <Route path="/invite/:inviteId" element={
          <PrivateRoute>
              <InvitePage />
          </PrivateRoute>} />
        <Route path="/meetings/:id" element={
          <ErrorBoundary>
            <Meeting />
          </ErrorBoundary>
        } />

        <Route
          path="/login"
          element={
            user ? <Navigate to={getHomePage(user.role)} /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to={getHomePage(user.role)} /> : <Register />
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRoles={['admin']}>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <PrivateRoute requiredRoles={['teacher']}>
              <TeacherHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/student"
          element={
            <PrivateRoute requiredRoles={['student']}>
              <StudentHome />
            </PrivateRoute>
          }
        />

        <Route
          path="/meeting/:id"
          element={
            <PrivateRoute>
              <Meeting />
            </PrivateRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;