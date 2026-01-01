import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, KeyRound } from 'lucide-react'
import { authAPI } from '../services/api.js'
import toast from 'react-hot-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const res = await authAPI.login({ email: email.trim(), password })
      const response = res.data || res
      // The backend returns 'access_token' and user data including 'is_admin'
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        toast.success('Login successful! Redirecting...')

        // Check if the user is an admin and navigate accordingly
        if (response.employee?.is_admin) {
          navigate('/dashboard')
        } else {
          navigate('/home')
        }
      } else {
        // Handle cases where the API response is successful but doesn't contain a token
        throw new Error('Authentication failed, no token received.')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.'
      toast.error(errorMessage)
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d3e50] via-[#34495e] to-[#3e6268] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/attendance_logo.png" alt="Logo" className="w-32 mx-auto" />
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-white">Admin Login</h2>
          <p className="text-white/70">Access the management dashboard</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3e6268] focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3e6268] focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#3e6268] to-[#5a8a98] hover:from-[#2d4a4e] hover:to-[#4a7680] text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none">
              {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <LogIn className="w-5 h-5" />}
              <span>{isLoading ? 'Logging In...' : 'Log In'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
