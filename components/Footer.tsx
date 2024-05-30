import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 py-8">
      <div className="max-w-7xl mx-auto text-center text-white">
        {/* Copyright & Social Links */}
        <p className="mb-4">
          &copy; {new Date().getFullYear()} LongevityVerse. All rights reserved.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="https://twitter.com/your_twitter_handle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Twitter
          </a>
          <a
            href="https://www.facebook.com/your_facebook_page"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Facebook
          </a>
          {/* Add more social links as needed */}
        </div>

        {/* Legal Links */}
        <div className="flex justify-center space-x-4 mt-4">
          <a href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="/terms-of-service" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
