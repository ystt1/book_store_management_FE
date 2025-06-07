// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'antd/dist/reset.css';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext'; // << IMPORT

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* BrowserRouter cần bao ngoài AuthProvider nếu AuthProvider dùng useNavigate */}
      <AuthProvider> {/* << WRAP APP */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);