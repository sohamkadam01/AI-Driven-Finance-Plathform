import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Intropage from './pages/intropage.jsx'
import AnomalyDetection from './pages/AnomalyDetection';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import BillReminders from './pages/BillReminders';
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'  // Import Transactions page
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Predictions from './pages/Predictions'
import Investments from './pages/Investments';
import InvestmentAdvice from './pages/InvestmentAdvice';
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Router>
        <Routes>
          <Route path="/" element={<Intropage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
  path="/notifications" 
  element={
    <PrivateRoute>
      <Notifications />
    </PrivateRoute>
  } 
/>
          <Route 
  path="/investments" 
  element={
    <PrivateRoute>
      <Investments />
    </PrivateRoute>
  } 
/>

          <Route 
  path="/investment-advice" 
  element={
    <PrivateRoute>
      <InvestmentAdvice />
    </PrivateRoute>
  } 
/>

          <Route 
  path="/predictions" 
  element={
    <PrivateRoute>
      <Predictions />
    </PrivateRoute>
  } 
/>
          <Route 
  path="/bill-reminders" 
  element={
    <PrivateRoute>
      <BillReminders />
    </PrivateRoute>
  } 
/>
          <Route 
  path="/budgets" 
  element={
    <PrivateRoute>
      <Budgets />
    </PrivateRoute>
  } 
/>
          <Route 
  path="/categories" 
  element={
    <PrivateRoute>
      <Categories />
    </PrivateRoute>
  } 
/>

<Route 
  path="/anomaly-detection" 
  element={
    <PrivateRoute>
      <AnomalyDetection />
    </PrivateRoute>
  } 
/>
          <Route 
            path="/transactions" 
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            } 
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
      </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)


// Add route
