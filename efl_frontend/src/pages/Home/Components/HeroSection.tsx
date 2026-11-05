import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import heroImage from '../../../assets/cs2.png';

const HeroSection: React.FC = () => {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <h1 className="hero__title">
            ASCENT
            <br />
            CS2 League
          </h1>
          <p className="hero__subtitle">
            Competitive Counter-Strike 2 League
            <br />
            Season One
          </p>
          <Link to="/register" className="btn-outline hero__cta">
            Register Team
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* Hero image */}
        <div className="hero__visual" aria-hidden="true">
          <img src={heroImage} alt="Hero character" style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.4)) blur(0.5px) brightness(0.5)' }} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
