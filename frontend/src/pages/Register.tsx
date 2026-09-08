import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import GlowBackground from '../components/GlowBackground'

const inputClass =
    'mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50'
const labelClass = 'block text-sm font-medium text-slate-300'

export default function Register() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [formError, setFormError] = useState('')
    const { register, isLoading, error, clearError } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        setFormError('')

        if (password !== confirmPassword) {
            setFormError('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setFormError('Password must be at least 8 characters')
            return
        }

        try {
            await register(email, username, password, fullName)
            navigate('/workflows')
        } catch (error) {
            // Error is handled by store
            console.error('Registration failed:', error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 text-slate-100">
            <GlowBackground />

            <div className="max-w-md w-full space-y-8 p-10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-2xl">
                <div>
                    <Link to="/" className="flex items-center justify-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 text-sm font-bold text-slate-950">
                            FA
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">FlowAI</span>
                    </Link>
                    <p className="mt-3 text-center text-sm text-slate-400">
                        Create your account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {(formError || error) && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            {formError || error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className={labelClass}>
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="username" className={labelClass}>
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={inputClass}
                                placeholder="username"
                            />
                        </div>

                        <div>
                            <label htmlFor="fullName" className={labelClass}>
                                Full Name (optional)
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className={inputClass}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className={labelClass}>
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className={labelClass}>
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={inputClass}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-400/20 transition-all hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                        >
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
