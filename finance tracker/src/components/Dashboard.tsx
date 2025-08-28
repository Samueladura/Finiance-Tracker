import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const Images = {
  income: '/images/money-bag.png',
  expenses: '/images/spending.png',
  balance: '/images/balance.png',
};

const categoryIcons: { [key: string]: string } = {
    Food: '/icons/Food.png',
    Rent: '/icons/Rent.png',
    Salary: '/icons/Salary.png',
    Entertainment: '/icons/Entertainment.png',
    Other: '/icons/Other.png',
};

type Transaction = {
  id: string;
  amount: number;
  category: string;
  date: string;
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<{ [category: string]: number }>({});

  useEffect(() => {
    const q = query(collection(db, 'transactions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: data.amount as number,
            category: data.category as string,
            date: data.date as string,
          } as Transaction;
        })
      );
    });
    return () => unsubscribe();
  }, []);

  if (transactions.length === 0) return <p className="p-4 text-center text-white">No data to display.
     <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
  </p>; 

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(
    transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
  );
  const balance = totalIncome - totalExpenses;

  const expenseData = transactions.filter((t) => t.amount < 0).reduce((acc: { [key: string]: number }, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as { [key: string]: number });  const pieData = {
    labels: Object.keys(expenseData),
    datasets: [
      {
        data: Object.values(expenseData),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const sortedTrans = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const lineData = {
    labels: sortedTrans.map((t) => t.date),
    datasets: [
      {
        label: 'Balance',
        data: sortedTrans.map((_, i) =>
          sortedTrans.slice(0, i + 1).reduce((sum, t) => sum + t.amount, 0)
        ),
        borderColor: '#36A2EB',
        fill: false,
      },
    ],
  };

  interface UpdateBudgetFn {
    (category: string, value: string): void;
  }

  const updateBudget: UpdateBudgetFn = (category, value) => {
    setBudgets({ ...budgets, [category]: Number(value) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          className="p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-700 dark:to-green-800 rounded-xl shadow-lg relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={Images.income}
            alt="Income"
            className="absolute top-2 right-2 w-10 h-10"
          />
          <h3 className="font-semibold text-white">Total Income</h3>
          <p className="text-xl">${totalIncome.toFixed(2)}</p>
        </motion.div>
        <motion.div
          className="p-4 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-700 dark:to-red-800 rounded-xl shadow-lg relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={Images.expenses}
            alt="Expenses"
            className="absolute top-2 right-2 w-10 h-10"
          />
          <h3 className="font-semibold text-white">Total Expenses</h3>
          <p className="text-xl">${totalExpenses.toFixed(2)}</p>
        </motion.div>
        <motion.div
          className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-700 dark:to-blue-800 rounded-xl shadow-lg relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={Images.balance}
            alt="Balance"
            className="absolute top-2 right-2 w-10 h-10"
          />
          <h3 className="font-semibold text-white">Balance</h3>
          <p className="text-xl">${balance.toFixed(2)}</p>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-semibold mb-2 text-white">Expenses by Category</h3>
          <Pie data={pieData} />
        </motion.div>
        <motion.div
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-semibold mb-2 text-white">Balance Over Time</h3>
          <Line data={lineData} />
        </motion.div>
      </div>
      <motion.div
        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="font-semibold mb-2 text-white">Set Budgets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(expenseData).map((cat) => (
            <div key={cat} className="flex flex-col space-y-2 text-white">
              <label className="font-medium flex items-center space-x-2 text-white">
                <img src={categoryIcons[cat]} alt={cat} className="w-5 h-5" />
                <span>{cat}</span>
              </label>
              <input
                type="number"
                onChange={(e) => updateBudget(cat, e.target.value)}
                className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                placeholder="Budget"
              />
              <p>
                Spent: ${expenseData[cat].toFixed(2)} / Budget: ${(budgets[cat] || 0).toFixed(2)}
                {budgets[cat] && expenseData[cat] > budgets[cat] && (
                  <span className="text-red-500 ml-2">Over budget!</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;