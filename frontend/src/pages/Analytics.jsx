import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Loader2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
    const { user } = useAuth();
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchAnalytics();
            fetchBudgets();
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get(`/api/analytics/category-spend/${user.user_id}`);
            const labels = res.data.map(d => d.category_name);
            const data = res.data.map(d => d.total_spent);

            setCategorySpend({
                labels,
                datasets: [{
                    label: 'Spending by Category',
                    data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                        'rgba(199, 199, 199, 0.5)',
                    ],
                    borderWidth: 1,
                }]
            });
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBudgets = async () => {
        try {
            const [budgetRes, catRes] = await Promise.all([
                api.get(`/api/budget/${user.user_id}`),
                api.get('/api/budget/categories')
            ]);
            setBudgets(budgetRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetBudget = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/budget/set', {
                user_id: user.user_id,
                category_id: selectedCategory,
                amount: parseFloat(budgetAmount)
            });
            alert("Budget set!");
            setBudgetAmount('');
            fetchBudgets();
        } catch (err) {
            alert("Failed to set budget");
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

            {/* Budget Management Section */}
            <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Budget Management</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-4">Set Monthly Budget</h4>
                        <form onSubmit={handleSetBudget} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    className="input mt-1"
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Limit (₹)</label>
                                <input
                                    type="number"
                                    className="input mt-1"
                                    value={budgetAmount}
                                    onChange={e => setBudgetAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-full">Set Budget</button>
                        </form>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-700 mb-4">Your Progress</h4>
                        {budgets.length > 0 ? budgets.map(b => (
                            <div key={b.category_id}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{b.category_name}</span>
                                    <span className={b.remaining < 0 ? 'text-red-500 font-bold' : 'text-gray-500'}>
                                        ₹{b.spent} / ₹{b.allocated}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${b.spent > b.allocated ? 'bg-red-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min((b.spent / b.allocated) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm italic">No budgets set yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-bold mb-4">Category Breakdown</h3>
                    <div className="h-64 flex justify-center">
                        {categoryData.length > 0 ? (
                            <Doughnut data={data} options={{ maintainAspectRatio: false }} />
                        ) : (
                            <p className="text-gray-400 self-center">No spending data</p>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-bold mb-4">Detailed Spend</h3>
                    <div className="h-64">
                        {categoryData.length > 0 ? (
                            <Bar data={data} options={{ maintainAspectRatio: false }} />
                        ) : (
                            <p className="text-gray-400 text-center py-12">No data available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
