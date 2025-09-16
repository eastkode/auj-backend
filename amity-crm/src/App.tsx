import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import UserList from './pages/admin/UserList';
import UserForm from './pages/admin/UserForm';
import UploadResults from './pages/admin/UploadResults';
import CourseManagement from './pages/admin/CourseManagement';
import LeadList from './pages/leads/LeadList';
import LeadForm from './pages/leads/LeadForm';
import LeadDetail from './pages/leads/LeadDetail';
import UploadLead from './pages/leads/UploadLead';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/users/new" element={<UserForm />} />
            <Route path="/admin/users/:id/edit" element={<UserForm />} />
            <Route path="/admin/upload-results" element={<UploadResults />} />
            <Route path="/admin/courses" element={<CourseManagement />} />

            <Route path="/leads" element={<LeadList />} />
            <Route path="/leads/upload" element={<UploadLead />} />
            <Route path="/leads/new" element={<LeadForm />} />
            <Route path="/leads/:id/edit" element={<LeadForm />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            {/* Other private routes */}
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
