import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  amount: number;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    // Fetch user transactions
    const transQuery = query(collection(db, 'transactions'), where('uid', '==', auth.currentUser.uid));
    const transUnsub = onSnapshot(
      transQuery,
      (snapshot) => {
        const transData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Transaction[];
        setTransactions(transData);
        setIsLoading(false);
      },
      (err) => {
        if (err instanceof Error) {
          setError('Failed to load transactions: ' + err.message);
        } else {
          setError('Failed to load transactions: An unknown error occurred');
        }
        setIsLoading(false);
      }
    );

    const goalsQuery = query(collection(db, 'goals'), where('uid', '==', auth.currentUser.uid));
    const goalsUnsub = onSnapshot(
      goalsQuery,
      (snapshot) => {
        setGoals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Goal[]);
      },
      (err) => {
        if (err instanceof Error) {
          setError('Failed to load goals: ' + err.message);
        } else {
          setError('Failed to load goals: An unknown error occurred');
        }
      }
    );

    return () => {
      transUnsub();
      goalsUnsub();
    };
  }, []);

  const netBalance = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !target || !deadline) {
      setError('All fields are required');
      return;
    }
    const targetNum = Number(target);
    if (targetNum <= 0) {
      setError('Target amount must be positive');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (deadline < today) {
      setError('Deadline cannot be in the past');
      return;
    }
    
    setError('');
    try {
      if (!auth.currentUser) {
        setError('User not authenticated');
        return;
      }
      
      await addDoc(collection(db, 'goals'), {
        name,
        targetAmount: targetNum,
        currentAmount: 0,
        deadline,
        uid: auth.currentUser.uid,
        createdAt: new Date(),
      });
      setName('');
      setTarget('');
      setDeadline('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError('Error adding goal: ' + error.message);
      } else {
        setError('Error adding goal: An unknown error occurred');
      }
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError('Error deleting goal: ' + error.message);
      } else {
        setError('Error deleting goal: An unknown error occurred');
      }
    }
  };

  const handleUpdateProgress = async (goalId: string, amount: number) => {
    try {
      const goalRef = doc(db, 'goals', goalId);
      await updateDoc(goalRef, { currentAmount: amount });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError('Error updating progress: ' + error.message);
      } else {
        setError('Error updating progress: An unknown error occurred');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Saving Goals</h2>

      <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleAddGoal} className="space-y-4">
          <motion.input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goal Name (e.g., Vacation)"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            required
            whileFocus={{ scale: 1.02 }}
          />
          <motion.input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target Amount"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            required
            min="0"
            step="0.01"
            whileFocus={{ scale: 1.02 }}
          />
          <motion.input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            required
            whileFocus={{ scale: 1.02 }}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <motion.button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white rounded-lg hover:from-[#3B82F6]/80 hover:to-[#10B981]/80 transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Goal
          </motion.button>
        </form>
      </motion.div>

      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progressPercentage = goal.targetAmount > 0 
              ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
              : 0;
              
            return (
              <motion.div
                key={goal.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white">{goal.name}</h3>
                    <p className="text-white">
                      Target: ${Number(goal.targetAmount).toFixed(2)} by {goal.deadline}
                    </p>
                    <p className="text-white">
                      Progress: ${Number(goal.currentAmount).toFixed(2)} (
                      {progressPercentage.toFixed(0)}%)
                    </p>
                  </div>
                  <img
                    src="/icons/Salary.png"
                    alt="Savings"
                    className="w-8 h-8 opacity-70"
                  />
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex space-x-2">
                  <motion.button
                    onClick={() =>
                      handleUpdateProgress(goal.id, goal.currentAmount + netBalance)
                    }
                    className="text-[#3B82F6] hover:underline cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    Allocate Net Balance (${netBalance.toFixed(2)})
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-500 hover:underline"
                    whileHover={{ scale: 1.05 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-center text-white">No goals yet. Add one above!</p>
        )}
      </div>
    </motion.div>
  );
};

export default Goals;