import { useState } from 'react';
import { auth, storage } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';

const AuthPage = ({ setPage }: { setPage: (page: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔹 Login Handler
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Check if setPage exists before calling it
      if (setPage && typeof setPage === 'function') {
        setPage('About');
      } else {
        console.error('setPage is not a function');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
    setLoading(false);
  };

  // 🔹 Signup Handler
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      let avatarUrl = '/icons/default-avatar.svg';
      
      // Only try to upload if avatar is selected
      if (avatar) {
        try {
          const avatarRef = ref(storage, `avatars/${userCredential.user.uid}`);
          await uploadBytes(avatarRef, avatar);
          avatarUrl = await getDownloadURL(avatarRef);
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          // Continue with default avatar if upload fails
        }
      }
      
      await updateProfile(userCredential.user, {
        displayName: name,
        photoURL: avatarUrl,
      });
      // Check if setPage exists before calling it
      if (setPage && typeof setPage === 'function') {
        setPage('About');
      } else {
        console.error('setPage is not a function');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
    setLoading(false);
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setAvatar(file);
      setError('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F9FAFB] dark:bg-[#1F2937]">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center">
        {/* Logo */}
        <motion.img
          src="/images/logo2.png"
          alt="Finance Tracker Logo"
          className="w-38 h-34 sm:w-40 sm:h-40 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {/* Form */}
        <form
          onSubmit={isLogin ? handleLogin : handleSignup}
          className="space-y-4 w-full"
        >
          {!isLogin && (
            <motion.input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              required={!isLogin}
              whileFocus={{ scale: 1.02 }}
            />
          )}

          <motion.input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            required
            whileFocus={{ scale: 1.02 }}
          />

          <motion.input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            required
            whileFocus={{ scale: 1.02 }}
          />

          {!isLogin && (
            <>
              <motion.input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                whileFocus={{ scale: 1.02 }}
              />
              {avatar && (
                <motion.img
                  src={URL.createObjectURL(avatar)}
                  alt="Avatar Preview"
                  className="w-20 h-20 object-cover rounded-full mx-auto mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg text-white transition-all disabled:opacity-50 ${
              isLogin
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#3B82F6]/80 hover:to-[#10B981]/80'
                : 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#3B82F6]/80 hover:to-[#10B981]/80'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading
              ? isLogin
                ? 'Logging in...'
                : 'Signing up...'
              : isLogin
              ? 'Login'
              : 'Sign Up'}
          </motion.button>
        </form>

        {/* Toggle */}
        <p className="mt-4 text-center text-white">
          {isLogin ? (
            <>
              Need an account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-[#3B82F6] hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-[#3B82F6] hover:underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default AuthPage;