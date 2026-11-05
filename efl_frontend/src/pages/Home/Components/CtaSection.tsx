import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const CtaSection: React.FC = () => (
  <section className="cta-section">
    <div className="container cta-banner panel">
      <div>
        <h2 className="cta-banner__title">Ready to compete?</h2>
        <p className="cta-banner__text text-secondary">
          Register your team for ASCENT Season One and fight for the top of the ranking!
        </p>
      </div>
      <Link to="/register" className="btn-primary cta-banner__cta">
        Register Team
        <ArrowUpRight size={18} />
      </Link>
    </div>
  </section>
);

export default CtaSection;
