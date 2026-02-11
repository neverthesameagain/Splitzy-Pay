import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { Loader2, Plus, Receipt } from 'lucide-react';

const GroupDetails = () => {
    const { groupId } = useParams();
    const { user } = useAuth();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    // Expense Form State
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [splits, setSplits] = useState({}); // {userId: amount}

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            const res = await api.get(`/api/groups/details/${groupId}`);
            setGroup(res.data);
            // Initialize equal splits
            const members = res.data.members || [];
            const initSplits = {};
            members.forEach(m => initSplits[m.user_id] = 0);
            setSplits(initSplits);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEqualSplit = () => {
        if (!amount || !group) return;
        const total = parseFloat(amount);
        const count = group.members.length;
        const share = (total / count).toFixed(2);

        // Adjust last person for rounding errors
        const newSplits = {};
        let runningTotal = 0;

        group.members.forEach((m, idx) => {
            if (idx === count - 1) {
                newSplits[m.user_id] = (total - runningTotal).toFixed(2);
            } else {
                newSplits[m.user_id] = share;
                runningTotal += parseFloat(share);
            }
        });
        setSplits(newSplits);
    };

    const submitExpense = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return alert("Invalid amount");

        // Validate split total
        const totalSplit = Object.values(splits).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        if (Math.abs(totalSplit - parseFloat(amount)) > 0.05) {
            return alert(`Splits total (${totalSplit}) must match expense amount (${amount})`);
        }

        const splitData = Object.entries(splits).map(([uid, amt]) => ({
            user_id: uid,
            amount: parseFloat(amt)
        }));

        try {
            await api.post('/api/payment/group-expense', {
                group_id: groupId,
                paid_by: user.user_id,
                amount: parseFloat(amount),
                description,
                splits: splitData
            });
            alert("Expense added!");
            setShowExpenseForm(false);
            setAmount('');
            setDescription('');
            // Refresh? In a real app we'd refresh the list of expenses.
        } catch (err) {
            alert("Error adding expense: " + (err.response?.data?.error || err.message));
        }
    };

    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    const handleAddMember = async (e) => {
        e.preventDefault();
        setAddingMember(true);
        try {
            await api.post('/api/groups/add-member', {
                group_id: groupId,
                email: newMemberEmail
            });
            alert('Member added!');
            setNewMemberEmail('');
            fetchGroupDetails();
        } catch (err) {
            alert('Failed to add member: ' + (err.response?.data?.error || err.message));
        } finally {
            setAddingMember(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    if (!group) return <div className="text-center p-12 text-red-600">Failed to load group details. Please try again.</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{group.group_name}</h2>
                    <p className="text-gray-500">{group.members.length} members</p>
                </div>
                <div className="flex gap-2">
                    {/* Add Member Form inline */}
                    <form onSubmit={handleAddMember} className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Add member by email..."
                            className="input py-1 px-3 text-sm h-10 w-64"
                            value={newMemberEmail}
                            onChange={e => setNewMemberEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={addingMember} className="btn btn-secondary h-10 flex items-center">
                            {addingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </button>
                    </form>
                </div>
            </header>

            <section>
                <button
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                    className="btn btn-primary flex items-center gap-2 mb-6"
                >
                    <Plus className="w-4 h-4" /> Add New Expense
                </button>

                {showExpenseForm && (
                    <div className="card bg-gray-50 mb-8 border-indigo-100">
                        <h3 className="font-bold text-lg mb-4">Add Expense</h3>
                        <form onSubmit={submitExpense} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <input
                                        type="number" className="input" placeholder="0.00"
                                        value={amount} onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <input
                                        type="text" className="input" placeholder="Dinner, Taxi..."
                                        value={description} onChange={e => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-sm text-gray-700">Split Breakdown</h4>
                                <button type="button" onClick={handleEqualSplit} className="text-xs text-indigo-600 font-medium hover:underline">
                                    Split Equally
                                </button>
                            </div>

                            <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-200">
                                {group.members.map(member => (
                                    <div key={member.user_id} className="flex justify-between items-center gap-4">
                                        <span className="text-sm text-gray-700 w-1/3 truncate">
                                            {member.first_name} {member.last_name}
                                        </span>
                                        <input
                                            type="number" step="0.01"
                                            className="input text-right"
                                            value={splits[member.user_id] || ''}
                                            onChange={(e) => setSplits({ ...splits, [member.user_id]: e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowExpenseForm(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Expense</button>
                            </div>
                        </form>
                    </div>
                )}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" /> Members
                    </h3>
                    <ul className="divide-y divide-gray-100">
                        {group.members.map(m => (
                            <li key={m.user_id} className="py-3 flex justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{m.first_name} {m.last_name}</p>
                                    <p className="text-xs text-gray-500">{m.email}</p>
                                </div>
                                <span className="text-sm text-gray-500">{m.role}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Receipt className="w-5 h-5" /> Recent Expenses
                    </h3>
                    {group.expenses && group.expenses.length > 0 ? (
                        <div className="space-y-4">
                            {group.expenses.map((exp) => (
                                <div key={exp.payment_id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{exp.description}</p>
                                        <p className="text-xs text-gray-500">Paid by {exp.paid_by_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{exp.amount}</p>
                                        <p className="text-xs text-gray-400">{new Date(exp.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm italic">No expenses yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupDetails;
