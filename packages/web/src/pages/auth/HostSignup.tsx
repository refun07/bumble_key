import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const HostSignup = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setServerError('');
        try {
            // Force role to host and sync password confirmation
            await registerUser({
                ...data,
                role: 'host',
                password_confirmation: data.password
            });
            navigate('/host/dashboard');
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] py-12 px-4 sm:px-6 lg:px-8">
            {/* Back to Home */}
            <div className="max-w-xl w-full mb-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            <div className="max-w-xl w-full bg-white rounded-[40px] shadow-sm border border-gray-100 p-12">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Sign Up with BumbleKey
                    </h2>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-5">
                        <Input
                            label="Your Name"
                            placeholder="Write the name"
                            className="rounded-xl border-gray-200"
                            {...register('name', { required: 'Name is required' })}
                            error={errors.name?.message as string}
                        />

                        <Input
                            label="Business Name"
                            placeholder="Write the name"
                            className="rounded-xl border-gray-200"
                            {...register('business_name')}
                        />

                        <Input
                            label="Phone No."
                            placeholder="Write the name"
                            className="rounded-xl border-gray-200"
                            {...register('phone')}
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="Write the name"
                            className="rounded-xl border-gray-200"
                            {...register('email', { required: 'Email is required' })}
                            error={errors.email?.message as string}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Write the name"
                            className="rounded-xl border-gray-200"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' }
                            })}
                            error={errors.password?.message as string}
                        />


                    </div>

                    {serverError && (
                        <div className="text-red-600 text-sm text-center font-medium">{serverError}</div>
                    )}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="bumble"
                            className="w-full py-4 text-lg"
                            isLoading={isLoading}
                        >
                            Sign Up
                        </Button>
                    </div>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest">OR</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <button type="button" className="flex items-center justify-center py-3.5 px-4 border border-gray-900 rounded-lg hover:bg-gray-50 transition-all text-[10px] font-bold text-gray-900 uppercase tracking-wider">
                            Singup with Google
                        </button>
                        <button type="button" className="flex items-center justify-center py-3.5 px-4 border border-gray-900 rounded-lg hover:bg-gray-50 transition-all text-[10px] font-bold text-gray-900 uppercase tracking-wider">
                            Singup with AirBNB
                        </button>
                        <button type="button" className="flex items-center justify-center py-3.5 px-4 border border-gray-900 rounded-lg hover:bg-gray-50 transition-all text-[10px] font-bold text-gray-900 uppercase tracking-wider">
                            Singup with AppleID
                        </button>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-500">
                            Already have an account? <Link to="/login" className="text-bumble-yellow font-bold hover:underline">Sign in</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HostSignup;
