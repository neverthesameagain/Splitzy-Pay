import { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        email: '',
        country_code: '+91',
        phone_number: '',
        password: '',
        confirm_password: '',
        opening_balance: ''
    });

    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Country phone length rules
    const countryPhoneLength = {
        "+91": 10,
        "+1": 10,
        "+44": 10,
    };

    const requiredPhoneLength = countryPhoneLength[formData.country_code];

    // Validation
    const isFormValid =
        formData.first_name.trim() !== "" &&
        formData.last_name.trim() !== "" &&
        formData.date_of_birth !== "" &&
        formData.gender !== "" &&
        formData.email.trim() !== "" &&
        formData.phone_number.length === requiredPhoneLength &&
        formData.password.trim() !== "" &&
        formData.password === formData.confirm_password;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid) return;

        setLoading(true);
        try {
            await api.post('/api/users/create', {
                ...formData,
                phone_number: formData.country_code + formData.phone_number
            });

            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            alert("Registration failed: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <UserPlus className="w-10 h-10 text-primary" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create an Account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Names */}
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                required
                                placeholder="First Name"
                                className="input"
                                value={formData.first_name}
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Last Name"
                                className="input"
                                value={formData.last_name}
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                            />
                        </div>

                        {/* DOB & Gender */}
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="date"
                                required
                                className="input"
                                max={new Date().toISOString().split("T")[0]}
                                value={formData.date_of_birth}
                                onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                            />
                            <select
                                required
                                className="input"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Select gender</option>
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Email */}
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            className="input"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />

                        {/* Country + Phone */}
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                className="input"
                                value={formData.country_code}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        country_code: e.target.value,
                                        phone_number: ""
                                    })
                                }
                            >
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                            </select>

                            <input
                                type="tel"
                                required
                                className="input"
                                placeholder={`Enter ${requiredPhoneLength} digits`}
                                value={formData.phone_number}
                                maxLength={requiredPhoneLength}
                                onChange={e => {
                                    const onlyNums = e.target.value.replace(/\D/g, "");
                                    if (onlyNums.length <= requiredPhoneLength) {
                                        setFormData({
                                            ...formData,
                                            phone_number: onlyNums
                                        });
                                    }
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="password"
                                required
                                placeholder="Password"
                                className="input"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <input
                                type="password"
                                required
                                placeholder="Confirm Password"
                                className="input"
                                value={formData.confirm_password}
                                onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                            />
                        </div>

                        {formData.confirm_password &&
                            formData.password !== formData.confirm_password && (
                                <p className="text-sm text-red-500">
                                    Passwords do not match
                                </p>
                            )}

                        {/* Opening Balance */}
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Opening Balance (Optional)"
                            className="input"
                            value={formData.opening_balance}
                            onChange={e => setFormData({ ...formData, opening_balance: e.target.value })}
                        />

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !isFormValid}
                            className={`w-full btn btn-primary flex justify-center ${
                                loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                        </button>

                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-primary font-medium">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
