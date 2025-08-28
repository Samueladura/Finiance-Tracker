import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { motion } from 'framer-motion';

const categoryIcons = {
    Food: '/icons/Food.png',
    Rent: '/icons/Rent.png',
    Salary: '/icons/Salary.png',
    Entertainment: '/icons/Entertainment.png',
    Other: '/icons/Other.png',
};

type Transaction = {
  id: string;
  date: string;
  category: keyof typeof categoryIcons;
  amount: number;
  type: string;
  notes?: string;
  imageUrl?: string;
};

const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTransactions([]);
        return;
      }
      
      const q = query(
        collection(db, 'transactions'),
        where('uid', '==', user.uid),
        orderBy('date', 'desc'));
      
      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const transactionsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date,
            category: data.category,
            amount: data.amount,
            type: data.type,
            notes: data.notes,
            imageUrl: data.imageUrl,
          } as Transaction;
        });
        setTransactions(transactionsData);
      }, (error) => {
        console.error('Error fetching transactions:', error);
      });
      
      return () => unsubscribeSnapshot();
    });
    
    return () => unsubscribe();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Transactions</h2>
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-white">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Notes</th>
                {/* <th className="p-3 text-left">Image</th> */}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <motion.tr
                  key={t.id}
                  className="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="p-3">{formatDate(t.date)}</td>
                  <td className="p-3 flex items-center space-x-2">
                    <img 
                      src={categoryIcons[t.category] || categoryIcons.Other} 
                      alt={t.category} 
                      className="w-5 h-5" 
                    />
                    <span>{t.category}</span>
                  </td>
                  <td 
                    className={`p-3 font-medium ${
                      t.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ${Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${
                        t.type === 'Income' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs truncate">{t.notes || '-'}</td>
                  {/* <td className="p-3">
                    {t.imageUrl ? (
                      <motion.img
                        src={t.imageUrl}
                        alt="Transaction"
                        className="w-12 h-12 object-cover rounded-lg cursor-pointer"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => window.open(t.imageUrl, '_blank')}
                      />
                    ) : (
                      '-'
                    )}
                  </td> */}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No transactions yet.
        </p>
      )}
    </motion.div>
  );
};

export default TransactionList;