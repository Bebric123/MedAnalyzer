import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import AnalysisStatusPage from './pages/AnalysisStatusPage';
import JournalPage from './pages/JournalPage';

import { useAuth } from './hooks/useAuth';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Загрузка...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

const UserLayout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header user={user} />
            <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    {/* Публичные маршруты */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/analysis/status/:sessionId" 
       element={<ProtectedRoute><AnalysisStatusPage /></ProtectedRoute>} />
                    <Route path="/journal" element={
                        <ProtectedRoute><JournalPage /></ProtectedRoute>
                    } />

                    {/* Пользовательские маршруты */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <UserLayout>
                                <Dashboard />
                            </UserLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/upload" element={
                        <ProtectedRoute>
                            <UserLayout>
                                <UploadPage />
                            </UserLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/results/:fileId" element={
                        <ProtectedRoute>
                            <UserLayout>
                                <ResultsPage />
                            </UserLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute>
                            <UserLayout>
                                <HistoryPage />
                            </UserLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;