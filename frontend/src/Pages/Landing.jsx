// src/pages/Landing.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import PricingPlans from '../components/PricingPlans';
import Footer from '../components/Footer';
import Features from '../components/Features';

const Landing = () => {
  return (
    <div className="min-h-screen ">
      <Navbar />
      <HeroSection />
      <Features/>
      {/* <PricingPlans/> */}
      <Footer/>
    </div>
  );
};

export default Landing;