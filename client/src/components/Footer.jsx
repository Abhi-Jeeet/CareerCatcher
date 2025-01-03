import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          {/* Company Info Section */}
          <div className="mb-4 text-center">
            <h2 className="text-lg font-semibold">CareerCatcher</h2>
            <p className="text-xs">Catch your job</p>
          </div>

          {/* Contact Info Section */}
          <div className="mt-4 text-center flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0">
            <div className="flex flex-col items-center md:mr-6">
              <p className="text-sm">Contact: +91 829XXXXXXX</p>
            </div>
            <div className="flex flex-col items-center md:ml-6">
              <p className="text-sm">Email: <a href="mailto:support@careercatcher.com" className="text-blue-400 hover:text-blue-600">abhijeet_2312res11@iitp.ac.in</a></p>
            </div>
          </div>

          {/* Copyright and "Made with Love" Section */}
          <div className="mt-4 text-center flex flex-col md:flex-row items-center justify-center">
            <p className="text-sm">Made with &hearts; by Abhijeet &copy; {new Date().getFullYear()} CareerCatcher. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
