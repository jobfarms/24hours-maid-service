import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { motion } from 'framer-motion';
import { easeInOut } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Zap } from 'lucide-react';

export default function CustomerHome() {
  const { user, isAuthenticated } = useAuth();
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [location, setLocation] = useState<string>('');

  const { data: services, isLoading: servicesLoading } = trpc.booking.getServices.useQuery();
  const createBookingMutation = trpc.booking.createBooking.useMutation();

  const handleCreateBooking = async () => {
    if (!selectedService || !scheduledDate || !location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const result = await createBookingMutation.mutateAsync({
        serviceId: selectedService,
        scheduledDate: new Date(scheduledDate),
        duration,
        location,
      });

      alert(`Booking created! Code: ${result.bookingCode}`);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: easeInOut }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: easeInOut }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent" variants={itemVariants}>
            24Hours Maid Services
          </motion.h1>
          <motion.p className="text-xl text-gray-400 mb-8" variants={itemVariants}>
            Premium domestic services at your fingertips
          </motion.p>

          {!isAuthenticated && (
            <motion.div className="flex gap-4 justify-center" variants={itemVariants}>
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">Get Started</button>
              <button className="px-6 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-cyan-400 font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95">Learn More</button>
            </motion.div>
          )}
        </motion.div>

        {isAuthenticated && user && (
          <motion.div
            className="grid lg:grid-cols-3 gap-8 mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Booking Form */}
            <motion.div className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl" variants={itemVariants}>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent mb-6">Book a Service</h2>

              <div className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">
                    Select Service
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {servicesLoading ? (
                      <div className="col-span-full text-center py-8">Loading services...</div>
                    ) : (
                      services?.map((service) => (
                        <motion.button
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={`p-4 rounded-xl transition-all duration-300 ${
                            selectedService === service.id
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                              : 'backdrop-blur-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-sm font-semibold">{service.name}</div>
                          <div className="text-xs text-gray-400 mt-1">₹{service.basePrice}</div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                    <Calendar size={18} />
                    Preferred Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 rounded-lg"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                    <Clock size={18} />
                    Duration (minutes)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 rounded-lg"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                    <option value={240}>4 hours</option>
                    <option value={480}>Full day (8 hours)</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                    <MapPin size={18} />
                    Service Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 rounded-lg"
                  />
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={handleCreateBooking}
                  disabled={createBookingMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap size={20} />
                  {createBookingMutation.isPending ? 'Creating Booking...' : 'Create Booking'}
                </motion.button>
              </div>
            </motion.div>

            {/* Info Cards */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl transition-all duration-300 hover:bg-white/8 hover:border-white/20">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">Quick Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Bookings</span>
                    <span className="text-cyan-300 font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Spent</span>
                    <span className="text-cyan-300 font-semibold">₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Services Used</span>
                    <span className="text-cyan-300 font-semibold">0</span>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl transition-all duration-300 hover:bg-white/8 hover:border-white/20">
                <h3 className="text-lg font-bold text-violet-400 mb-3">Why Choose Us?</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span>Verified professionals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span>Secure payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span>24/7 support</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Services Showcase */}
        <motion.div
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent mb-8 text-center">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicesLoading ? (
              <div className="col-span-full text-center py-12">Loading services...</div>
            ) : (
              services?.map((service, idx) => (
                <motion.div
                  key={service.id}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl transition-all duration-300 hover:bg-white/8 hover:border-white/20 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{service.name}</h3>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Popular</div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-cyan-400">₹{service.basePrice}</span>
                    <button className="px-3 py-2 backdrop-blur-xl bg-white/5 border border-white/10 text-cyan-400 font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95 text-sm">Book Now</button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
