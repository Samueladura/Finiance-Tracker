import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { motion } from 'framer-motion';

const categoryIcons = {
  Food: '/icons/Food.png',
  Rent: '/icons/Rent.png',
  Salary: '/icons/Salary.png',
  Entertainment: '/icons/Entertainment.png',
  Other: '/icons/Other.png',
};

type Category = keyof typeof categoryIcons;

const AddTransaction: React.FC = () => {
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!auth.currentUser) {
      setError('You must be logged in to add a transaction');
      setLoading(false);
      return;
    }

    if (!date || !amount || !category) {
      setError('Date, amount, and category are required');
      setLoading(false);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number');
      setLoading(false);
      return;
    }

    let imageUrl = '';
    try {
      if (image) {
        console.log('Uploading image:', image.name);
        const imageRef = ref(storage, `transaction-images/${auth.currentUser.uid}/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
        console.log('Image uploaded:', imageUrl);
      }

      const transactionData = {
        date,
        category,
        amount: type === 'Income' ? amountNum : -amountNum,
        type,
        notes,
        imageUrl,
        uid: auth.currentUser.uid,
        createdAt: new Date(),
      };
      console.log('Saving transaction:', transactionData);
      await addDoc(collection(db, 'transactions'), transactionData);
      alert('Transaction added!');
      setDate('');
      setAmount('');
      setCategory('Food');
      setType('Expense');
      setNotes('');
      setImage(null);
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError(`Failed to add transaction: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Add Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <motion.input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          required
          whileFocus={{ scale: 1.02 }}
        />
        <div className="relative">
          <motion.select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] appearance-none"
            required
            whileFocus={{ scale: 1.02 }}
          >
            {Object.keys(categoryIcons).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </motion.select>
          <img
            src={categoryIcons[category]}
            alt={category}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
          />
        </div>
        <motion.input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          required
          min="0.01"
          step="0.01"
          whileFocus={{ scale: 1.02 }}
        />
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="Income"
              checked={type === 'Income'}
              onChange={() => setType('Income')}
              className="accent-[#3B82F6]"
            />
            <span className="text-white">Income</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="Expense"
              checked={type === 'Expense'}
              onChange={() => setType('Expense')}
              className="accent-[#3B82F6]"
            />
            <span className="text-white">Expense</span>
          </label>
        </div>
        <motion.input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          whileFocus={{ scale: 1.02 }}
        />
        {/* <motion.input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          whileFocus={{ scale: 1.02 }}
        /> */}
        {/* {image && (
          <motion.img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )} */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <motion.button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-lg transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#3B82F6]/80 hover:to-[#10B981]/80'
          } text-white`}
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
        >
          {loading ? 'Adding...' : 'Add Transaction'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AddTransaction;