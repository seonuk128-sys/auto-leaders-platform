import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RentForm from './RentForm';
import InsuranceForm from './InsuranceForm';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <header className="main-header">
          <h1>장기렌트/리스 상담 신청</h1>
        </header>
        
        <main className="content">
          <Routes>
            {/* 기본 경로로 들어오면 장기렌트 페이지로 리다이렉트하거나 메인 안내 페이지를 보여줄 수 있습니다 */}
            <Route path="/" element={<Navigate to="/rent" />} />
            
            <Route path="/rent" element={<RentForm />} />
            <Route path="/insurance" element={<InsuranceForm />} />
          </Routes>
        </main>

        <footer className="main-footer">
          <p>&copy; 2024 상담 신청 플랫폼. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
