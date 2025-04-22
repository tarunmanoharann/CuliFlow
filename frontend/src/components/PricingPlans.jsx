import React from 'react';
import { CheckIcon } from 'lucide-react';
import BgBg from '../assets/bgbg.jpg';

const PricingPlans = () => {
  const plans = [
    {
      name: 'Starter',
      price: '₹4999',
      period: '/month',
      description: 'Perfect for small restaurants starting their journey',
      features: [
        'Basic sales analytics',
        'Up to 1,000 transactions/month',
        'Email support',
        'Basic inventory tracking',
        'Single location support',
        'Standard reports'
      ],
      cta: 'Start free trial'
    },
    {
      name: 'Professional',
      price: '₹8999',
      period: '/month',
      description: 'Ideal for growing restaurants with multiple locations',
      features: [
        'Advanced analytics & forecasting',
        'Unlimited transactions',
        'Priority support 24/7',
        'Advanced inventory management',
        'Multi-location support',
        'Custom reports & dashboards',
        'Staff performance tracking',
        'Integration with POS systems'
      ],
      cta: 'Start free trial',
      featured: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large restaurant chains and franchises',
      features: [
        'All Professional features',
        'Dedicated account manager',
        'Custom API access',
        'Advanced security features',
        'Custom integrations',
        'Franchise management tools',
        'Brand analytics',
        'Company-wide insights'
      ],
      cta: 'Contact sales'
    }
  ];

  return (
    <section id="pricing" className="relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${BgBg})`
        }}
      />

      <div className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pricing plans for businesses of all sizes
            </h2>
            <p className="text-xl text-gray-300">
              Choose the perfect plan for your restaurant's needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg bg-white/10 backdrop-blur-lg overflow-hidden border border-white/20 ${
                  plan.featured ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-300 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  <button
                    className={`w-full py-3 px-6 rounded-md font-medium ${
                      plan.featured
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    } transition-colors`}
                  >
                    {plan.cta}
                  </button>
                </div>
                <div className="px-8 pb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;