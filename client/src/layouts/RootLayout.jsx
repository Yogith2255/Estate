import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './RootLayout.css';

export default function RootLayout() {
  return (
    <div className="root-layout">
      <Navbar />
      <main className="root-layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
