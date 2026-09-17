/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, QuoteRecord, QueueItem, AuthUser, UserProfile } from './types';
import { initialQuotes, initialQueueItems } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardScreen } from './components/DashboardScreen';
import { OcrUploadScreen } from './components/OcrUploadScreen';
import { AuthScreen } from './components/AuthScreen';

const DEFAULT_USER_PROFILE: UserProfile = {
  nombre: 'Administrador CAFI',
  cargo: 'Gerente de Operaciones y Analítica',
  correo: 'tucafi.mkt@gmail.com',
  departamento: 'Operaciones y Analítica',
  concesionaria: 'Operaciones y Analítica',
  telefono: '(967) 674 05 39 Ext. 435',
  rol: 'Admin Coti-CAFI',
  avatarUrl: ''
};

export default function App() {
  // Authentication State with local session check
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem('cafi_auth_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.expiresAt && parsed.expiresAt > Date.now()) {
          return true;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [transitionType, setTransitionType] = useState<'none' | 'push_back'>('none');

  // User Profile State with localStorage persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('cafi_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nombre && (parsed.nombre.includes('Sofía') || parsed.nombre.includes('Sofia'))) {
          return DEFAULT_USER_PROFILE;
        }
        return { ...DEFAULT_USER_PROFILE, ...parsed };
      }
    } catch (e) {
      console.error('Error cargando perfil en App:', e);
    }
    return DEFAULT_USER_PROFILE;
  });

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('cafi_user_profile', JSON.stringify(updated));
      const authSession = localStorage.getItem('cafi_auth_session');
      if (authSession) {
        try {
          const parsed = JSON.parse(authSession);
          if (parsed?.user) {
            parsed.user = { ...parsed.user, ...updated };
            localStorage.setItem('cafi_auth_session', JSON.stringify(parsed));
          }
        } catch {}
      }
    } catch (e) {
      console.error('Error guardando perfil en localStorage:', e);
    }
  };

  // Load quotes from localStorage or fallback to initialQuotes
  const [quotes, setQuotes] = useState<QuoteRecord[]>(() => {
    try {
      const saved = localStorage.getItem('cafi_quotes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error cargando cotizaciones guardadas:', e);
    }
    return initialQuotes;
  });

  // Load queue from localStorage or fallback to initialQueueItems
  const [queue, setQueue] = useState<QueueItem[]>(() => {
    try {
      const saved = localStorage.getItem('cafi_ocr_queue');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error cargando cola OCR guardada:', e);
    }
    return initialQueueItems;
  });

  // Automatically save quotes on any change
  useEffect(() => {
    try {
      localStorage.setItem('cafi_quotes', JSON.stringify(quotes));
    } catch (e) {
      console.error('Error guardando cotizaciones en localStorage:', e);
    }
  }, [quotes]);

  // Automatically save queue on any change
  useEffect(() => {
    try {
      localStorage.setItem('cafi_ocr_queue', JSON.stringify(queue));
    } catch (e) {
      console.error('Error guardando cola OCR en localStorage:', e);
    }
  }, [queue]);

  const handleNavigate = (targetScreen: Screen, transition: 'none' | 'push_back' = 'none') => {
    setTransitionType(transition);
    setCurrentScreen(targetScreen);
  };

  const handleConfirmAndAdd = (newQuote?: QuoteRecord) => {
    if (newQuote) {
      setQuotes((prev) => [newQuote, ...prev]);
      setQueue((prev) => prev.map(item => item.id === newQuote.id ? { ...item, estado: 'confirmado' } : item));
    }
    handleNavigate('dashboard', 'push_back');
  };

  const handleDeleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter(q => q.id !== id));
  };

  const handleUpdateQuote = (updated: QuoteRecord) => {
    setQuotes((prev) => prev.map(q => q.id === updated.id ? updated : q));
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('cafi_auth_session');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
  };

  const pendingCount = queue.filter(q => q.estado !== 'confirmado').length;

  // If not logged in, render the high-security AuthScreen with Google reCAPTCHA
  if (!isAuthenticated || currentScreen === 'auth') {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        defaultEmail="tucafi.mkt@gmail.com"
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8f9ff] text-[#0b1c30]">
      {/* Persistent Sidebar containing xpath //aside//a[@data-path='...'] */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(target) => handleNavigate(target, 'none')}
        pendingCount={pendingCount}
        onLogout={handleLogout}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          quotes={quotes} 
          onLogout={handleLogout} 
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
        />

        <div className="flex-1 flex overflow-hidden relative">
          <AnimatePresence mode="wait">
            {currentScreen === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={transitionType === 'push_back' ? { opacity: 0.7, x: -60 } : { opacity: 1, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={transitionType === 'push_back' ? { duration: 0.3, ease: 'easeOut' } : { duration: 0 }}
                className="flex-1 flex overflow-hidden w-full h-full"
              >
                <DashboardScreen 
                  quotes={quotes}
                  onNavigateToUpload={() => handleNavigate('ocr-upload', 'none')}
                  onDeleteQuote={handleDeleteQuote}
                  onUpdateQuote={handleUpdateQuote}
                />
              </motion.div>
            )}

            {currentScreen === 'ocr-upload' && (
              <motion.div
                key="ocr-upload"
                initial={{ opacity: 1, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={transitionType === 'push_back' ? { opacity: 0, x: 60 } : { opacity: 0 }}
                transition={transitionType === 'push_back' ? { duration: 0.3, ease: 'easeIn' } : { duration: 0 }}
                className="flex-1 flex flex-col overflow-hidden w-full h-full"
              >
                <OcrUploadScreen
                  queue={queue}
                  setQueue={setQueue}
                  onConfirmAndAdd={handleConfirmAndAdd}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
