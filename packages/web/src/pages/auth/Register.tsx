import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Register = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setServerError('');
        try {
            await registerUser(data);
            if (data.role === 'host') {
                navigate('/host/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Back to Home */}
            <div className="max-w-md w-full mb-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            {...register('name', { required: 'Name is required' })}
                            error={errors.name?.message as string}
                        />

                        <Input
                            label="Email address"
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            error={errors.email?.message as string}
                        />

                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="host"
                                    {...register('role', { required: true })}
                                    className="mr-2"
                                    defaultChecked
                                />
                                Host
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="partner"
                                    {...register('role', { required: true })}
                                    className="mr-2"
                                />
                                Partner
                            </label>
                        </div>

                        {watch('role') === 'host' && (
                            <Input
                                label="Business Name (Optional)"
                                {...register('business_name')}
                            />
                        )}

                        <Input
                            label="Password"
                            type="password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' }
                            })}
                            error={errors.password?.message as string}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            {...register('password_confirmation', {
                                required: 'Please confirm your password',
                                validate: (val: string) => {
                                    if (watch('password') != val) {
                                        return "Your passwords do not match";
                                    }
                                }
                            })}
                            error={errors.password_confirmation?.message as string}
                        />
                    </div>

                    {serverError && (
                        <div className="text-red-600 text-sm text-center">{serverError}</div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3"
                            isLoading={isLoading}
                        >
                            Sign up
                        </Button>
                    </div>

                    <div className="text-center mt-4 space-y-2">
                        <Link to="/login" className="block text-sm text-blue-600 hover:text-blue-500">
                            Already have an account? Sign in
                        </Link>
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1 font-medium">Are you a host?</p>
                            <Link to="/host/signup" className="text-sm text-bumble-yellow font-bold hover:underline">
                                Use the dedicated Host Signup
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
