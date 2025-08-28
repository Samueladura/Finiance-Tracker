import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const About = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [counterValues, setCounterValues] = useState({ users: 0, transactions: 0, goals: 0 });

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;

    const targetValues = { users: 500, transactions: 10000, goals: 2000 };
    const duration = 2000; // ms
    const startTime = Date.now();

    const animateCounters = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCounterValues({
        users: Math.floor(targetValues.users * progress),
        transactions: Math.floor(targetValues.transactions * progress),
        goals: Math.floor(targetValues.goals * progress),
      });

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animateCounters);
      }
    };

    rafRef.current = requestAnimationFrame(animateCounters);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [inView]);

  const validateEmail = (email: string) => {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        uid: auth.currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
      });

      setSuccess('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: unknown) {
      let msg = 'An unknown error occurred';
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === 'string') {
        msg = err;
      }
      setError('Error sending message: ' + msg);
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '+2349019536951';
    const cleaned = phoneNumber.replace(/\D/g, '');
    const waMessage = encodeURIComponent(`Hi from Finance Tracker: ${message || 'I have a question!'}`);
    const url = `https://wa.me/${cleaned}?text=${waMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 max-w-4xl mx-auto min-h-screen">

      <motion.div
        className="bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white p-8 rounded-xl shadow-lg text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}>
        <img
          src="/images/logo2.png"
          alt="Finance Tracker Logo"
          className="w-16 h-16 sm:w-30 sm:h-30 mx-auto mb-4"/>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">About Finance Tracker</h1>
        <p className="text-lg sm:text-xl">
          Finance Tracker is your ultimate tool for managing personal finances with ease. Track expenses, set budgets, achieve savings goals, and manage subscriptions all in one sleek, modern app designed to simplify your financial life.
        </p>
      </motion.div>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}>
        <h2 className="text-2xl font-bold mb-6 text-center text-white">What Our Users Say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white">
          {[
            {
              quote: "This app transformed how I manage my money! The savings goals feature keeps me motivated.",
              author: "Jane D., Entrepreneur",
            },
            {
              quote: "The subscription manager helped me save $200 by canceling unused services!",
              author: "Mark S., Freelancer",
            },
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <p className="italic mb-4">"{testimonial.quote}"</p>
              <p className="font-semibold text-right">— {testimonial.author}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        ref={ref}
        className="bg-gray-100 dark:bg-gray-700 p-8 rounded-xl shadow-lg mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Our Impact</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <motion.p
              className="text-3xl sm:text-4xl font-bold text-[#3B82F6]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {counterValues.users.toLocaleString()}
            </motion.p>
            <p className='text-white'>Active Users</p>
          </div>
          <div>
            <motion.p
              className="text-3xl sm:text-4xl font-bold text-[#3B82F6]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {counterValues.transactions.toLocaleString()}
            </motion.p>
            <p className="text-white">Transactions Tracked</p>
          </div>
          <div>
            <motion.p
              className="text-3xl sm:text-4xl font-bold text-[#3B82F6]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {counterValues.goals.toLocaleString()}
            </motion.p>
            <p className="text-white">Goals Achieved</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Contact Us</h2>
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <motion.input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            aria-label="Your name"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            required
          />
          <motion.input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email"
            aria-label="Your email"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            required
          />
          <motion.textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your Message"
            aria-label="Your message"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            rows={4}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              type="submit"
              className="w-full sm:w-auto p-3 bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white rounded-lg hover:from-[#3B82F6]/80 hover:to-[#10B981]/80 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send Message
            </motion.button>
            <motion.button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full sm:w-auto p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Message via WhatsApp
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default About;