import { useState } from 'react';
import { useRoute } from 'wouter';
import { motion } from 'framer-motion';
import {
  getStateBySlug,
  getCityBySlug,
  getAreaBySlug,
  getLocationBreadcrumbs,
} from '@shared/locations';
import { MapPin, Phone, MessageCircle, CheckCircle } from 'lucide-react';

export default function LocationPage() {
  const [route, params] = useRoute('/locations/:state/:city?/:area?');
  const [formData, setFormData] = useState({ name: '', phone: '', service: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  if (!route) return null;

  const stateSlug = (params as any)?.state;
  const citySlug = (params as any)?.city;
  const areaSlug = (params as any)?.area;

  const state = getStateBySlug(stateSlug);
  const city = citySlug ? getCityBySlug(stateSlug, citySlug) : null;
  const area = areaSlug ? getAreaBySlug(stateSlug, citySlug, areaSlug) : null;
  const breadcrumbs = getLocationBreadcrumbs(stateSlug, citySlug, areaSlug);

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Location Not Found</h1>
          <p className="text-gray-400">The location you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const pageTitle = area ? `${area.name}, ${city?.name}, ${state.name}` : city ? `${city.name}, ${state.name}` : state.name;
  const pageDescription = area
    ? `Professional domestic services in ${area.name}, ${city?.name}. Verified maids, cooks, nannies, and drivers available 24/7.`
    : city
      ? `Premium household services in ${city.name}, ${state.name}. Book verified professionals for cleaning, cooking, childcare, and more.`
      : `Domestic services across ${state.name}. Find trusted maids, cooks, nannies, and drivers in your area.`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Send lead to backend
    console.log('Lead submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      {/* Breadcrumbs */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <a href={crumb.url} className="hover:text-cyan-400 transition-colors">
                  {crumb.name}
                </a>
                {idx < breadcrumbs.length - 1 && <span>/</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          className="mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent mb-4"
            variants={itemVariants}
          >
            {pageTitle}
          </motion.h1>
          <motion.p className="text-xl text-gray-400 mb-8 max-w-2xl" variants={itemVariants}>
            {pageDescription}
          </motion.p>

          {/* Location Info */}
          <motion.div className="flex items-center gap-4 text-gray-300" variants={itemVariants}>
            <MapPin className="text-cyan-400" size={24} />
            <span>
              {area && `${area.name}, `}
              {city && `${city.name}, `}
              {state.name}
            </span>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="grid lg:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Services & Content */}
          <motion.div
            className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl"
            variants={itemVariants}
          >
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Available Services</h2>

            <div className="space-y-6">
              {[
                {
                  title: 'Domestic Maids',
                  description: 'Professional house cleaning and maintenance services',
                  icon: '🧹',
                },
                {
                  title: 'Professional Cooks',
                  description: 'Experienced chefs for daily cooking and meal preparation',
                  icon: '👨‍🍳',
                },
                {
                  title: 'Nannies & Childcare',
                  description: 'Trusted caregivers for your children\'s safety and development',
                  icon: '👶',
                },
                {
                  title: 'Drivers',
                  description: 'Professional and reliable transportation services',
                  icon: '🚗',
                },
                {
                  title: 'Elderly Care',
                  description: 'Compassionate care for senior family members',
                  icon: '👴',
                },
                {
                  title: 'Pet Care',
                  description: 'Professional pet sitting and walking services',
                  icon: '🐕',
                },
              ].map((service, idx) => (
                <motion.div
                  key={idx}
                  className="flex gap-4 p-4 backdrop-blur-lg bg-white/3 border border-white/5 rounded-lg hover:bg-white/5 transition-all"
                  whileHover={{ x: 5 }}
                >
                  <span className="text-3xl">{service.icon}</span>
                  <div>
                    <h3 className="font-bold text-white mb-1">{service.title}</h3>
                    <p className="text-sm text-gray-400">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Why Choose Us */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-2xl font-bold text-blue-400 mb-6">Why Choose 24Hours?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Verified & background-checked professionals',
                  '24/7 customer support',
                  'Transparent pricing',
                  'Flexible scheduling',
                  'Secure payment options',
                  'Quality guarantee',
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Lead Capture Form */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Contact Form */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Get Started Today</h3>

              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
                  <p className="text-green-400 font-semibold mb-2">Thank you!</p>
                  <p className="text-gray-400 text-sm">
                    We'll contact you shortly with available options.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    <option value="">Select Service</option>
                    <option value="maid">Domestic Maid</option>
                    <option value="cook">Professional Cook</option>
                    <option value="nanny">Nanny</option>
                    <option value="driver">Driver</option>
                    <option value="elderly-care">Elderly Care</option>
                    <option value="pet-care">Pet Care</option>
                  </select>
                  <textarea
                    placeholder="Tell us your requirements"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Get Instant Quote
                  </button>
                </form>
              )}
            </div>

            {/* Quick Contact */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-blue-400 mb-4">Quick Contact</h3>
              <div className="space-y-3">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-3 p-3 backdrop-blur-lg bg-white/3 border border-white/5 rounded-lg hover:bg-white/5 transition-all"
                >
                  <Phone className="text-cyan-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Call Now</p>
                    <p className="text-white font-semibold">+91 98765 43210</p>
                  </div>
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 backdrop-blur-lg bg-white/3 border border-white/5 rounded-lg hover:bg-white/5 transition-all"
                >
                  <MessageCircle className="text-green-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">WhatsApp</p>
                    <p className="text-white font-semibold">Chat with us</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-violet-400 mb-4">Why Trust Us?</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>10,000+ verified professionals</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>Background checks & verification</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>Secure payment & insurance</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: `24Hours Maid Services - ${pageTitle}`,
          description: pageDescription,
          url: `https://24hoursmaid.com/locations/${stateSlug}${citySlug ? `/${citySlug}` : ''}${areaSlug ? `/${areaSlug}` : ''}`,
          areaServed: {
            '@type': 'Place',
            name: pageTitle,
          },
          serviceType: [
            'Domestic Cleaning',
            'Cooking Services',
            'Childcare',
            'Driver Services',
            'Elderly Care',
            'Pet Care',
          ],
          telephone: '+919876543210',
          priceRange: '₹₹',
        })}
      </script>
    </div>
  );
}
