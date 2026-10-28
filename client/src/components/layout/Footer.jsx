import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const currentYear = CURRENT_YEAR;

  return (
    <footer className="marketplace-footer">
      <div className="container marketplace-footer__container">
        {/* Brand Column */}
        <div className="marketplace-footer__col">
          <Link to="/marketplace" className="marketplace-footer__logo">
            <span className="marketplace-footer__logo-icon">
              <Building2 size={18} />
            </span>
            <span className="marketplace-footer__logo-text">
              Estate<span className="marketplace-footer__logo-accent">Hub</span>
            </span>
          </Link>
          <p className="marketplace-footer__tagline">
            Enterprise real estate management platform and verified residential property marketplace connecting buyers, developers, and licensed brokers across India.
          </p>
          <div className="marketplace-footer__contact">
            <div className="marketplace-footer__contact-item">
              <MapPin size={13} />
              <span>Tower 4, Financial District, Gachibowli, Hyderabad 500032</span>
            </div>
            <div className="marketplace-footer__contact-item">
              <Phone size={13} />
              <span>+91 (040) 4899 1200</span>
            </div>
            <div className="marketplace-footer__contact-item">
              <Mail size={13} />
              <span>operations@estatehub.in</span>
            </div>
          </div>
        </div>

        {/* Metro Clusters */}
        <div className="marketplace-footer__col">
          <h4 className="marketplace-footer__col-title">Metro Hubs</h4>
          <ul className="marketplace-footer__links">
            <li><Link to="/marketplace/properties?city=Hyderabad">Hyderabad Properties</Link></li>
            <li><Link to="/marketplace/properties?city=Bengaluru">Bengaluru Tech Corridor</Link></li>
            <li><Link to="/marketplace/properties?city=Mumbai">Mumbai Prime Residences</Link></li>
            <li><Link to="/marketplace/properties?city=Pune">Pune Hinjawadi Hub</Link></li>
            <li><Link to="/marketplace/properties?city=Chennai">Chennai Coastal Enclaves</Link></li>
          </ul>
        </div>

        {/* Enterprise Operations */}
        <div className="marketplace-footer__col">
          <h4 className="marketplace-footer__col-title">Enterprise System</h4>
          <ul className="marketplace-footer__links">
            <li><Link to="/admin">Operations Dashboard</Link></li>
            <li><Link to="/admin/projects">Project Portfolio</Link></li>
            <li><Link to="/admin/leads">Prospect CRM</Link></li>
            <li><Link to="/admin/inventory">Unit Inventory</Link></li>
            <li><Link to="/admin/site-visits">Site Visit Scheduling</Link></li>
          </ul>
        </div>

        {/* Regulatory & Standards */}
        <div className="marketplace-footer__col">
          <h4 className="marketplace-footer__col-title">RERA & Compliance</h4>
          <div className="marketplace-footer__standards">
            <div className="marketplace-footer__standard-item">
              <ShieldCheck size={14} className="marketplace-footer__standard-icon" />
              <span>100% RERA Registered Projects</span>
            </div>
            <div className="marketplace-footer__standard-item">
              <ShieldCheck size={14} className="marketplace-footer__standard-icon" />
              <span>Direct Developer Data Feeds</span>
            </div>
            <p className="marketplace-footer__disclaimer">
              All listed developments feature verified state RERA registration numbers and verified floor plans.
            </p>
          </div>
        </div>
      </div>

      <div className="marketplace-footer__bottom">
        <div className="container marketplace-footer__bottom-inner">
          <span>&copy; {currentYear} EstateHub Technologies India Pvt Ltd. All rights reserved.</span>
          <div className="marketplace-footer__bottom-links">
            <span>RERA Disclosures</span>
            <span>&bull;</span>
            <span>Terms of Service</span>
            <span>&bull;</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
