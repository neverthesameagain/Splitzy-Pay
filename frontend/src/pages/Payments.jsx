import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Send, Loader2 } from 'lucide-react';

const Payments = () => {
    const { user } = useAuth();
    const [targetUsers, setTargetUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/api/users/');
                // Filter out self
                setTargetUsers(res.data.filter(u => u.user_id !== user.user_id));
            } catch (err) {
                console.error(err);
            } finally {
                setFetching(false);
            }
        };
        fetchUsers();
    }, [user]);

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!amount || !selectedUser) return;

        setLoading(true);
        try {
            // 1. Initiate
            const initRes = await api.post('/api/payment/initiate', {
                amount: parseFloat(amount),
                to_user_id: selectedUser,
                current_user_id: user.user_id
                // In real app we get Razorpay Order ID here
            });

            // 2. Confirm (Simulating Success)
            await api.post('/api/payment/confirm', {
                from_user: user.user_id,
                to_user: selectedUser,
                amount: parseFloat(amount),
                payment_type: 'PERSONAL',
                razorpay_order_id: initRes.data.razorpay_order_id,
                razorpay_payment_id: 'pay_mock_' + Date.now(), // Mock ID
                category_id: null // Or 'Others'
            });

            alert('Payment Successful!');
            setAmount('');
            setSelectedUser('');
        } catch (err) {
            alert('Payment Failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Make a Payment</h2>

            <div className="card">
                <form onSubmit={handlePayment} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Payee</label>
                        <select
                            className="input"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            required
                        >
                            <option value="">-- Choose User --</option>
                            {!fetching && targetUsers.map(u => (
                                <option key={u.user_id} value={u.user_id}>
                                    {u.first_name} {u.last_name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">₹</span>
                            <input
                                type="number"
                                className="input pl-7"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary flex justify-center items-center gap-2 py-3 text-lg"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
                        {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                </form>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                Note: Use this to settle debts or make direct transfers. For group expenses, go to the Group page.
            </div>
        </div>
    );
};

export default Payments;
