import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, TrendingUp, Wallet, AlertCircle } from 'lucide-react';

export default function MaidDashboard() {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);

  const { data: profile } = trpc.maid.getProfile.useQuery();
  const { data: earnings } = trpc.maid.getEarnings.useQuery({ limit: 10 });
  const updateAvailabilityMutation = trpc.maid.updateAvailability.useMutation();

  const handleAvailabilityToggle = async () => {
    try {
      await updateAvailabilityMutation.mutateAsync({
        isAvailable: !isAvailable,
      });
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent">
              Maid Dashboard
            </h1>
            <motion.button
              onClick={handleAvailabilityToggle}
              disabled={updateAvailabilityMutation.isPending}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                isAvailable
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                  : 'backdrop-blur-xl bg-white/5 border border-white/10 text-gray-400'
              }`}
            >
              {isAvailable ? '✓ Available' : '✗ Unavailable'}
            </motion.button>
          </div>
          <p className="text-gray-400">Welcome back, {user?.name || 'Maid'}</p>
        </motion.div>

        {/* Stats Grid */}
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
              <h3 className="text-gray-400 text-sm font-semibold">Total Earnings</h3>
              <TrendingUp className="text-cyan-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-cyan-400">
              ₹{profile?.wallet?.balance || '0'}
            </p>
          </motion.div>

          <motion.div
            className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-semibold">Average Rating</h3>
              <AlertCircle className="text-violet-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-violet-400">
              {profile?.averageRating?.toFixed(1) || '0'} / 5
            </p>
          </motion.div>

          <motion.div
            className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-semibold">Total Jobs</h3>
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {profile?.totalRatings || '0'}
            </p>
          </motion.div>

          <motion.div
            className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-semibold">Availability</h3>
              <Clock className="text-blue-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {isAvailable ? 'Online' : 'Offline'}
            </p>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="grid lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Recent Earnings */}
          <motion.div
            className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">Recent Earnings</h2>
            <div className="space-y-4">
              {earnings?.transactions && earnings.transactions.length > 0 ? (
                earnings.transactions.map((transaction: any, idx: number) => (
                  <motion.div
                    key={idx}
                    className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/3 border border-white/5 rounded-lg"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Wallet size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {transaction.type === 'credit' ? 'Job Payment' : 'Withdrawal'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === 'credit'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {transaction.type === 'credit' ? '+' : '-'}₹
                      {Math.abs(parseFloat(transaction.amount.toString())).toFixed(2)}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No transactions yet</p>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-violet-400 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 active:scale-95">
                  View Active Jobs
                </button>
                <button className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-cyan-400 font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95">
                  Withdraw Earnings
                </button>
                <button className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-cyan-400 font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95">
                  View Profile
                </button>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-blue-400 mb-4">Profile Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-white font-semibold">✓ Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Services</span>
                  <span className="text-white font-semibold">
                    {profile?.serviceTypes?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white font-semibold">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
