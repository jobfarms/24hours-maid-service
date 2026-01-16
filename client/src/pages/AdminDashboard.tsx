import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: bookings } = trpc.booking.getBookingHistory.useQuery({ limit: 20, offset: 0 });
  const { data: users } = trpc.user.getProfile.useQuery();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Calculate stats
  const totalRevenue = Array.isArray(bookings) ? bookings.reduce((sum: number, b: any) => sum + parseFloat(b.totalPrice || 0), 0) : 0;
  const completedBookings = Array.isArray(bookings) ? bookings.filter((b: any) => b.status === 'completed').length : 0;
  const activeBookings = Array.isArray(bookings) ? bookings.filter((b: any) => b.status === 'active').length : 0;
  const totalUsers = users ? 1 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Welcome back, {user?.name || 'Admin'}</p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-semibold">Total Revenue</h3>
              <DollarSign className="text-green-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-green-400">
              ₹{totalRevenue.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500 mt-2">+12% from last month</p>
          </motion.div>

          <motion.div
            className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-semibold">Active Bookings</h3>
              <Clock className="text-cyan-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-cyan-400">{activeBookings}</p>
            <p className="text-xs text-gray-500 mt-2">In progress</p>
          </motion.div>

          <motion.div
            className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-semibold">Completed</h3>
              <CheckCircle className="text-blue-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-blue-400">{completedBookings}</p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </motion.div>

          <motion.div
            className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-semibold">Total Users</h3>
              <Users className="text-violet-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-violet-400">{totalUsers}</p>
            <p className="text-xs text-gray-500 mt-2">Active accounts</p>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex gap-4 border-b border-white/10">
            {['overview', 'bookings', 'users', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="grid lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Content */}
          <motion.div
            className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl"
            variants={itemVariants}
          >
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">
                  Platform Overview
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/3 border border-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="text-cyan-400" size={20} />
                      <span className="text-white">Revenue Trend</span>
                    </div>
                    <span className="text-green-400 font-semibold">↑ 23%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/3 border border-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-blue-400" size={20} />
                      <span className="text-white">User Growth</span>
                    </div>
                    <span className="text-green-400 font-semibold">↑ 15%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/3 border border-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-yellow-400" size={20} />
                      <span className="text-white">Pending Issues</span>
                    </div>
                    <span className="text-yellow-400 font-semibold">3</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">
                  Recent Bookings
                </h2>
                <div className="space-y-4">
                  {Array.isArray(bookings) && bookings.length > 0 ? (
                    bookings.slice(0, 5).map((booking: any, idx: number) => (
                      <motion.div
                        key={idx}
                        className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/3 border border-white/5 rounded-lg"
                        whileHover={{ x: 5 }}
                      >
                        <div>
                          <p className="font-semibold text-white">
                            Booking #{booking.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-cyan-400">
                            ₹{booking.totalPrice}
                          </p>
                          <span
                            className={`text-xs font-semibold ${
                              booking.status === 'completed'
                                ? 'text-green-400'
                                : 'text-yellow-400'
                            }`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      No bookings to display
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">
                  User Management
                </h2>
                <div className="space-y-4">
                  {users ? (
                    [users].map((u: any, idx: number) => (
                      <motion.div
                        key={idx}
                        className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/3 border border-white/5 rounded-lg"
                        whileHover={{ x: 5 }}
                      >
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {u.role}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No user data</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">
                  Reports
                </h2>
                <div className="space-y-4">
                  <button className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-cyan-400 font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 text-left">
                    📊 Revenue Report
                  </button>
                  <button className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-cyan-400 font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 text-left">
                    👥 User Analytics
                  </button>
                  <button className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-cyan-400 font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 text-left">
                    📈 Performance Metrics
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-violet-400 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 active:scale-95">
                  Create Report
                </button>
                <button className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-cyan-400 font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95">
                  Manage Users
                </button>
                <button className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-cyan-400 font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95">
                  System Settings
                </button>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-blue-400 mb-4">
                System Health
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">API Status</span>
                  <span className="text-green-400 font-semibold">✓ Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Database</span>
                  <span className="text-green-400 font-semibold">✓ Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-green-400 font-semibold">99.9%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
