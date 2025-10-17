import React from 'react';

type Page = 'management' | 'cash-register';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
    const activeClasses = "bg-primary-700 text-white";
    const inactiveClasses = "text-white hover:bg-primary-500 hover:bg-opacity-75";
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {children}
        </button>
    );
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onLogout }) => {
  return (
    <header className="bg-primary-600 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.838-6.837a1.875 1.875 0 0 0-1.09-2.228l-8.468-2.54a1.875 1.875 0 0 0-2.228 1.09l-1.838 6.837a1.875 1.875 0 0 0 1.09 2.228Z" />
            </svg>
            <h1 className="text-xl font-bold text-white">Caisse QR</h1>
          </div>
          <nav className="flex items-center space-x-2">
            <NavButton isActive={currentPage === 'management'} onClick={() => onNavigate('management')}>
              Gestion
            </NavButton>
            <NavButton isActive={currentPage === 'cash-register'} onClick={() => onNavigate('cash-register')}>
              Caisse
            </NavButton>
          </nav>
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-primary-500 hover:bg-opacity-75 transition-colors duration-200"
            title="Déconnexion"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
