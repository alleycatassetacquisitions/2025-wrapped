import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Alleycat 2025 Wrapped' }) => {
  const router = useRouter();
  
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Bounty Hunter statistics and performance data from 2025, provided by Alleycat Asset Aquisitions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-cyber-black">
        <header className="py-4 border-b-2 border-neon-blue">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image 
                  src="/images/branding/Logo on Transparent.png"
                  alt="Alleycat Asset Aquisitions Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority={true}
                />
                <span className="text-xl md:text-3xl font-heading neon-text-blue font-bold">
                  ALLEYCAT 2025 WRAPPED
                </span>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className={`text-cyber-text hover:neon-text-blue transition-all duration-300 ${router.pathname === '/' ? 'neon-text-blue' : ''}`}>
                  Home
                </Link>
                <Link href="/search" className={`text-cyber-text hover:neon-text-blue transition-all duration-300 ${router.pathname === '/search' ? 'neon-text-blue' : ''}`}>
                  Search
                </Link>
                <Link href="/leaderboards" className={`text-cyber-text hover:neon-text-blue transition-all duration-300 ${router.pathname === '/leaderboards' ? 'neon-text-blue' : ''}`}>
                  Leaderboards
                </Link>
                <Link href="/stats" className={`text-cyber-text hover:neon-text-blue transition-all duration-300 ${router.pathname === '/stats' ? 'neon-text-blue' : ''}`}>
                  Global Stats
                </Link>
              </nav>
              <div className="md:hidden flex items-center">
                <button 
                  className="text-cyber-text hover:neon-text-blue"
                  aria-label="Open Menu"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="py-6 border-t-2 border-neon-purple">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0 flex items-center">
                <Image 
                  src="/images/branding/Logo on Transparent.png"
                  alt="Alleycat Asset Aquisitions Logo"
                  width={30}
                  height={30}
                  className="object-contain mr-2"
                  priority={true}
                />
                <p className="text-cyber-text text-sm">
                  © {new Date().getFullYear()} <span className="neon-text-purple">Alleycat Asset Aquisitions</span>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout; 