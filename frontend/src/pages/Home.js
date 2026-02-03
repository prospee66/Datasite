import React from 'react';
import { Link } from 'react-router-dom';
import {
  BoltIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const features = [
  {
    icon: BoltIcon,
    title: 'Instant Delivery',
    description: 'Get your data bundle delivered to your phone within seconds after payment.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Payments',
    description: 'All transactions are protected with Paystack\'s bank-level security.',
    gradient: 'from-emerald-400 to-green-500',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Best Prices',
    description: 'Enjoy competitive prices on all data bundles across all networks.',
    gradient: 'from-blue-400 to-primary-500',
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'All Networks',
    description: 'Buy data for MTN, Telecel, and AirtelTigo all in one place.',
    gradient: 'from-purple-400 to-accent-500',
  },
];

const networks = [
  { name: 'MTN', color: 'from-yellow-400 to-yellow-500', textColor: 'text-gray-900', plans: ['1GB - GHS 5', '5GB - GHS 18', '20GB - GHS 50'] },
  { name: 'Telecel', color: 'from-red-500 to-red-600', textColor: 'text-white', plans: ['1GB - GHS 5', '5GB - GHS 15', '15GB - GHS 45'] },
  { name: 'AirtelTigo', color: 'from-red-500 via-purple-500 to-blue-500', textColor: 'text-white', plans: ['1.5GB - GHS 5', '4GB - GHS 14', '12GB - GHS 35'] },
];

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] sm:min-h-[85vh] flex items-center bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent-500/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-float" />
          <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-accent-400/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-primary-300/40 rounded-full animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <SparklesIcon className="h-4 w-4 text-accent-300" />
              <span className="text-sm font-medium text-white/90">Trusted by 10,000+ Ghanaians</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-3 w-3 text-yellow-400" />
                ))}
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-slide-up">
              Buy Data Bundles
              <span className="block mt-2 text-gradient-gold">Instantly in Ghana</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-primary-100/90 mb-8 max-w-2xl mx-auto px-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Get affordable data bundles for MTN, Telecel, and AirtelTigo.
              Fast, secure, and reliable service.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/register"
                className="btn btn-lg bg-white text-primary-700 hover:bg-gray-50 shadow-xl shadow-black/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 group"
              >
                Get Started Free
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/buy-data"
                className="btn btn-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50"
              >
                Buy Data Now
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {[
                { value: '10K+', label: 'Users' },
                { value: '50K+', label: 'Transactions' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-primary-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Networks Section */}
      <section className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              All Networks
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Choose Your <span className="text-gradient">Network</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Buy data for any mobile network in Ghana at the best prices
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {networks.map((network, index) => (
              <div
                key={network.name}
                className="group card card-hover p-6 sm:p-8 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${network.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`text-2xl sm:text-3xl font-bold ${network.textColor}`}>{network.name[0]}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{network.name}</h3>
                <ul className="space-y-3 mb-6">
                  {network.plans.map((plan, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">{plan}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/buy-data"
                  className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 group/link"
                >
                  View all plans
                  <ArrowRightIcon className="h-4 w-4 ml-2 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-accent-100 text-accent-700 rounded-full text-sm font-semibold mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              The <span className="text-gradient">Smart Choice</span> for Data
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              OPTIMISTIC EMPIRE is your trusted partner for mobile data purchases in Ghana
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 border border-white/50 animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Get Data in <span className="text-gradient">3 Steps</span>
            </h2>
            <p className="text-gray-600 text-lg">Lightning fast and super easy</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 relative">
            {/* Connection line */}
            <div className="hidden sm:block absolute top-16 left-[20%] right-[20%] h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-accent-400 rounded-full" />

            {[
              { step: 1, title: 'Choose Bundle', desc: 'Select your network and preferred data bundle', icon: DevicePhoneMobileIcon, color: 'from-primary-500 to-primary-600' },
              { step: 2, title: 'Make Payment', desc: 'Pay securely with Mobile Money or Card', icon: CurrencyDollarIcon, color: 'from-accent-500 to-accent-600' },
              { step: 3, title: 'Get Data', desc: 'Receive your data instantly on your phone', icon: BoltIcon, color: 'from-emerald-500 to-green-600' },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10 group hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-gray-900">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-primary-100 mb-8 text-lg sm:text-xl max-w-2xl mx-auto">
            Join thousands of Ghanaians who trust OPTIMISTIC EMPIRE for their data needs. Start saving today!
          </p>
          <Link
            to="/register"
            className="btn btn-lg bg-white text-primary-700 hover:bg-gray-50 shadow-xl shadow-black/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group inline-flex"
          >
            Create Free Account
            <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="mt-6 text-primary-200 text-sm">
            No credit card required. Start buying data in minutes.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
