import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, Calendar, CheckCircle, XCircle } from 'lucide-react';

const FutureExpenses = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form Link
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [categoryId, setCategoryId] = useState('');

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [expRes, catRes] = await Promise.all([
                api.get(`/api/future/${user.user_id}`),
                api.get('/api/budget/categories')
            ]);
            setExpenses(expRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/future/add', {
                user_id: user.user_id,
                category_id: categoryId,
                estimated_amount: parseFloat(amount),
                expected_date: date
            });
            alert('Future expense planned!');
            setAmount('');
            setDate('');
            setCategoryId('');
            fetchData();
        } catch (err) {
            alert('Failed to add expense');
        }
    };

    const handleStatus = async (id, status) => {
        try {
            await api.post('/api/future/update-status', {
                future_expense_id: id,
                status
            });
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" /> Future Expenses
            </h2>

            {/* Form */}
            <div className="card bg-indigo-50 border-indigo-100">
                <h3 className="font-bold mb-4">Plan New Expense</h3>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                            <option value="">Select...</option>
                            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Estimated Amount</label>
                        <input type="number" className="input" value={amount} onChange={e => setAmount(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Expected Date</label>
                        <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Plan It</button>
                </form>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {expenses.map(exp => (
                    <div key={exp.future_expense_id} className="card flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <h4 className="font-bold">{exp.category_name}</h4>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${exp.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                        exp.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>{exp.status}</span>
                            </div>
                            <p className="text-sm text-gray-500">Expected: {new Date(exp.expected_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">₹{exp.estimated_amount}</span>
                            {exp.status === 'PLANNED' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleStatus(exp.future_expense_id, 'PAID')} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Mark Paid">
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleStatus(exp.future_expense_id, 'CANCELLED')} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Cancel">
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {expenses.length === 0 && <p className="text-center text-gray-500 py-8">No planned expenses.</p>}
            </div>
        </div>
    );
};

export default FutureExpenses;
