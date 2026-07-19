import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Globe } from "lucide-react";
import "../styles/PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  // Scroll to top when page is loaded
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="privacy-container">
      {/* Background Ambient Lights */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div className="grid-overlay"></div>

      {/* Back Button Container */}
      <div className="back-btn-container">
        <button onClick={() => navigate("/")} className="btn-back">
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>

      <div className="privacy-card">
        <div className="privacy-header">
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-updated">Last Updated: July 2026</p>
        </div>

        <div className="privacy-content">
          <p>
            At <strong>Eklavya Engineering Classes</strong>, we respect your
            privacy and are committed to protecting the personal information you
            share with us. This Privacy Policy explains how we collect, use,
            store, and protect your information when you visit our website,
            submit an enquiry, or contact us through Facebook, Instagram,
            WhatsApp, or Meta Lead Forms.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We may collect the following information:</p>
          <ul>
            <li>Full Name</li>
            <li>Mobile Number</li>
            <li>Email Address (if provided)</li>
            <li>Course Interested In</li>
            <li>Branch / Semester Details</li>
            <li>Messages or Enquiries submitted by you</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            Your information is used only for educational and admission purposes,
            including:
          </p>
          <ul>
            <li>Providing admission guidance</li>
            <li>Contacting you regarding enquiries</li>
            <li>Scheduling free demo lectures</li>
            <li>Sharing course details and fee structure</li>
            <li>Providing academic updates</li>
            <li>Student support services</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, rent, trade, or share your personal information with
            third parties for marketing purposes. Your information is only
            accessed by authorized staff of Eklavya Engineering Classes for
            admission and academic communication.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement reasonable security measures to safeguard your personal
            information against unauthorized access, misuse, or disclosure.
          </p>

          <h2>5. Meta (Facebook & Instagram) Lead Ads</h2>
          <p>
            If you submit your information through Meta Lead Ads, Facebook,
            Instagram, Messenger, or WhatsApp, the information you provide will
            be used solely for responding to your enquiry, providing admission
            details, scheduling demo lectures, and communicating academic
            information related to Eklavya Engineering Classes.
          </p>

          <h2>6. Cookies</h2>
          <p>
            Our website may use cookies or similar technologies to improve user
            experience, analyze website traffic, and enhance website performance.
          </p>

          <h2>7. Your Rights</h2>
          <p>
            You may request access, correction, or deletion of your personal
            information by contacting us through the details provided below.
          </p>

          <div className="contact-box">
            <h3>Eklavya Engineering Classes</h3>
            <p className="contact-address">
              M-17, Athwa Arcade, Athwa Gate, Surat, Gujarat - 395001
            </p>

            <div className="contact-info-list">
              <div className="contact-item">
                <Phone className="contact-icon" size={18} />
                <div className="contact-text">
                  <strong>Phone:</strong> +91 8000864123
                </div>
              </div>


              <div className="contact-item">
                <Phone className="contact-icon" size={18} />
                <div className="contact-text">
                  <strong>WhatsApp:</strong> +91 9904084123
                </div>
              </div>

              <div className="contact-item">
                <Mail className="contact-icon" size={18} />
                <div className="contact-text">
                  <strong>Email:</strong> eklavyaclasses14@gmail.com
                </div>
              </div>

              <div className="contact-item">
                <Globe className="contact-icon" size={18} />
                <div className="contact-text">
                  <strong>Website:</strong> https://eklavyaengineeringclasses.in
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
