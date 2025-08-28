import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from '../firebase';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  uid: string;
  createdAt: Date;
}

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch subscriptions for the current user
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'subscriptions'), where('uid', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs: Subscription[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Subscription));
      setSubscriptions(subs);
    }, (err) => {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load subscriptions: ' + err.message);
    });
    return () => unsubscribe();
  }, []);

  // Handle adding or updating a subscription
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!auth.currentUser) {
      setError('Please log in to manage subscriptions');
      setLoading(false);
      return;
    }

    if (!name || !amount) {
      setError('Name and amount are required');
      setLoading(false);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number');
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        // Update existing subscription
        await updateDoc(doc(db, 'subscriptions', editingId), {
          name,
          amount: amountNum,
          frequency,
          uid: auth.currentUser.uid,
          createdAt: new Date(),
        });
        setSuccess('Subscription updated successfully!');
        setEditingId(null);
      } else {
        // Add new subscription
        await addDoc(collection(db, 'subscriptions'), {
          name,
          amount: amountNum,
          frequency,
          uid: auth.currentUser.uid,
          createdAt: new Date(),
        });
        setSuccess('Subscription added successfully!');
      }
      setName('');
      setAmount('');
      setFrequency('monthly');
    } catch (err) {
      console.error('Error saving subscription:', err);
      setError('Error saving subscription: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a subscription
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subscriptions', id));
      setSuccess('Subscription deleted successfully!');
    } catch (err) {
      console.error('Error deleting subscription:', err);
      setError('Error deleting subscription: ' + (err as Error).message);
    }
  };

  // Handle editing a subscription
  const handleEdit = (sub: Subscription) => {
    setName(sub.name);
    setAmount(sub.amount.toString());
    setFrequency(sub.frequency);
    setEditingId(sub.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Manage Subscriptions</h2>

      {/* Add/Edit Subscription Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
        <motion.input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subscription Name (e.g., Netflix)"
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          required
          whileFocus={{ scale: 1.02 }}
        />
        <motion.input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          required
          min="0"
          step="0.01"
          whileFocus={{ scale: 1.02 }}
        />
        <motion.select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as 'monthly' | 'yearly')}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          whileFocus={{ scale: 1.02 }}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </motion.select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white rounded-lg hover:from-[#3B82F6]/80 hover:to-[#10B981]/80 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Saving...' : editingId ? 'Update Subscription' : 'Add Subscription'}
        </motion.button>
      </form>

      {/* Subscription List */}
      <div className="space-y-4">
        {subscriptions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No subscriptions found.</p>
        ) : (
          subscriptions.map((sub) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">{sub.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  ${sub.amount.toFixed(2)} / {sub.frequency}
                </p>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => handleEdit(sub)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(sub.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Subscriptions;