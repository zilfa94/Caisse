import React, { useState, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import ManagementPage from './components/ManagementPage';
import CashRegisterPage from './components/CashRegisterPage';
import Header from './components/Header';
import { ProductProvider } from './context/ProductContext';

type Page = 'management' | 'cash-register';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('management');

  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentPage('management');
  }, []);

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <ProductProvider>
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />
        <main className="p-4 sm:p-6 lg:p-8">
          {currentPage === 'management' && <ManagementPage />}
          {currentPage === 'cash-register' && <CashRegisterPage />}
        </main>
      </div>
    </ProductProvider>
  );
};

export default App;
