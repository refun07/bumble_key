import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setServerError('');
        console.log('Attempting login with:', data);
        try {
            await login(data);
            const user = useAuth.getState().user;
            console.log('Login successful, user:', user);

            if (user?.role === 'admin') {
                console.log('Redirecting to Admin Dashboard');
                navigate('/admin/dashboard');
            } else if (user?.role === 'host') {
                console.log('Redirecting to Host Dashboard');
                navigate('/host/dashboard');
            } else {
                console.log('Redirecting to Dashboard');
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setServerError(error.response?.data?.message || 'Login failed');
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
                        Sign in to BumbleKey
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <Input
                            label="Email address"
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            error={errors.email?.message as string}
                        />
                        <div className="mt-4">
                            <Input
                                label="Password"
                                type="password"
                                {...register('password', { required: 'Password is required' })}
                                error={errors.password?.message as string}
                            />
                        </div>
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
                            Sign in
                        </Button>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-bold text-gray-900 hover:text-bumble-yellow transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-2 bg-gray-50 text-xs text-gray-500 font-medium">Are you a host?</span>
                            </div>
                        </div>

                        <Link to="/host/signup" className="block">
                            <Button variant="outline" className="w-full py-3">
                                Sign up as a Host
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
