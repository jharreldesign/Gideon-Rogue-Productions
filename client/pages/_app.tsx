import React from 'react';
import { AppProps } from 'next/app';
import { UserProvider } from '../context/UserContex';
import Header from '../components/Header';
import '../styles/globals.css';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <UserProvider>
      {/* Main layout structure */}
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Component {...pageProps} />
        </main>
      </div>
    </UserProvider>
  );
};

export default MyApp;