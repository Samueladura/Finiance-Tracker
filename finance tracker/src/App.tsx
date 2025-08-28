import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import AddTransaction from './components/AddTransaction';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import About from './components/About';
import AuthPage from './components/AuthPage';
import Subscriptions from './components/Subscription';
// import { Switch } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function App() {
  const [page, setPage] = useState('Auth');
  // const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && page === 'Auth') {
        setPage('About');
      } else if (!user) {
        setPage('Auth');
      }
    });
    return () => unsubscribe();
  }, [page, auth]);

  // useEffect(() => {
  //   if (darkMode) {
  //     document.documentElement.classList.add('dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //   }
  // }, [darkMode]);

  useEffect(() => {
    console.log('Adding beforeinstallprompt event listener');
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired', e);
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User installed the PWA');
      }
      setDeferredPrompt(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setPage('Auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1F2937]">
      <nav className="bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white p-2">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/images/logo2.png" alt="Logo" className="w-24 h-22" />
            <h1 className="text-xl font-bold">Finance Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* <motion.img
              src={user?.photoURL || '/icons/default-avatar.svg'}
              alt="User"
              className="w-8 h-8 rounded-full"
              whileHover={{ scale: 1.1 }}
            /> */}
            {/* <Switch
              checked={darkMode}
              onChange={setDarkMode}
              className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-200 dark:bg-gray-600"
            >
              <span
                className={`absolute left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 transform ${
                  darkMode ? 'translate-x-5' : ''
                }`}
              />
            </Switch> */}

          {deferredPrompt && (
            <motion.button
              onClick={handleInstallClick}
              className="sm:hidden text-sm bg-white/20 px-2 py-1 rounded"
              whileHover={{ scale: 1.05 }}
            >
              Install App
            </motion.button>
          )}

            <div className="hidden sm:flex space-x-4">
              {user ? (
                <>
                  <button onClick={() => setPage('About')} className="hover:underline cursor-pointer">
                    About
                  </button>
                  <button onClick={() => setPage('Add')} className="hover:underline cursor-pointer">
                    Add Transaction
                  </button>
                  <button onClick={() => setPage('List')} className="hover:underline cursor-pointer">
                    View Transactions
                  </button>
                  <button onClick={() => setPage('Dashboard')} className="hover:underline cursor-pointer">
                    Dashboard
                  </button>
                  <button onClick={() => setPage('Goals')} className="hover:underline cursor-pointer">
                    Goals
                  </button>
                  <button onClick={() => setPage('Subscriptions')} className="hover:underline cursor-pointer">
                    Subscriptions
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="hover:underline cursor-pointer">
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={() => setPage('About')} className="hover:underline cursor-pointer">
                  About
                </button>
              )}
              {deferredPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="hover:underline"
                  >
                    Install App
                  </button>
                )}
            </div>
            <button
              className="sm:hidden text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>
        <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="sm:hidden fixed top-0 right-0 w-64 h-full bg-gradient-to-b from-[#3B82F6] to-[#10B981] text-white p-4 z-50 shadow-lg">
            {/* <button className="text-2xl mb-4" onClick={() => setIsMenuOpen(false)}>
              x
            </button> */}
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <button
                  onClick={() => {
                    setPage('About');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-white/20 rounded">
                  About
                </button>
                <button
                  onClick={() => {
                    setPage('Add');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-white/20 rounded">
                  Add Transaction
                </button>
                <button
                  onClick={() => {
                    setPage('List');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-white/20 rounded">
                  View Transactions
                </button>
                <button
                  onClick={() => {
                    setPage('Dashboard');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-white/20 rounded">
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setPage('Goals');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-white/20 rounded">
                  Goals
                </button>
                <button
                  onClick={() => {
                    setPage('Subscriptions');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-white/20 rounded">
                  Subscriptions
                  </button>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-white/20 rounded">
                  Logout
                </button>
                </>
              ) 
              : (
                <button
                  onClick={() => {
                    setPage('About');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-white/20 rounded">
                  About
                </button>
              )}
               {deferredPrompt && (
                      <button
                        onClick={() => {
                          handleInstallClick();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left p-2 hover:bg-white/20 rounded"
                      >
                        Install App
                      </button>
                    )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </nav>
      <div className="max-w-4xl mx-auto pt-16">
        {page === 'Auth' && !user && <AuthPage setPage={setPage} />}
        {page === 'Add' && user && <AddTransaction />}
        {page === 'List' && user && <TransactionList />}
        {page === 'Dashboard' && user && <Dashboard />}
        {/* {page === 'Profile' && user && <Profile />} */}
        {page === 'Goals' && user && <Goals />}
        {page === 'Subscriptions' && user && <Subscriptions />}
        {page === 'About' && <About />}
      </div>
    </div>
  );
}

export default App;