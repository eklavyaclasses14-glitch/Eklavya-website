import React from 'react';
import StudentLayout from '../components/StudentLayout';
import { User, Mail, Hash, BookOpen, GraduationCap, MapPin, Phone } from 'lucide-react';
import '../styles/StudentProfile.css';

const StudentProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const student = user?.user || {};

  const profileDetails = [
    { label: 'Full Name', value: student.name || 'Not provided', icon: <User size={18} /> },
    { label: 'Email Address', value: student.email || 'Not provided', icon: <Mail size={18} /> },
    { label: 'Enrollment No.', value: student.user_id || student.id_number || 'Not provided', icon: <Hash size={18} /> },
    { label: 'Department', value: student.department || 'Not provided', icon: <BookOpen size={18} /> },
    { label: 'Semester', value: student.semester ? `Semester ${student.semester}` : 'Not provided', icon: <GraduationCap size={18} /> },
    { label: 'Student Mobile', value: student.student_contact || student.phone || 'Not provided', icon: <Phone size={18} /> },
    { label: 'Parent Mobile', value: student.parent_contact || 'Not provided', icon: <Phone size={18} /> },
  ];

  const avatarUrl = student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=4f46e5&color=fff&bold=true&size=128`;

  return (
    <StudentLayout>
      <div className="profile-container">
        <div className="profile-header-card">
          <div className="profile-avatar-wrapper">
            <img src={avatarUrl} alt={student.name} className="profile-avatar-img" />
          </div>
          <div className="profile-header-info">
            <h1 className="profile-name">{student.name}</h1>
            <p className="profile-role">Student · {student.department}</p>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="profile-card">
            <h2 className="profile-card-title">Academic Information</h2>
            <div className="profile-info-list">
              {profileDetails.slice(2, 5).map((detail, idx) => (
                <div key={idx} className="profile-info-item">
                  <div className="profile-info-icon">{detail.icon}</div>
                  <div className="profile-info-content">
                    <span className="profile-info-label">{detail.label}</span>
                    <span className="profile-info-value">{detail.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <h2 className="profile-card-title">Personal Information</h2>
            <div className="profile-info-list">
              {profileDetails.slice(0, 2).concat(profileDetails.slice(5)).map((detail, idx) => (
                <div key={idx} className="profile-info-item">
                  <div className="profile-info-icon">{detail.icon}</div>
                  <div className="profile-info-content">
                    <span className="profile-info-label">{detail.label}</span>
                    <span className="profile-info-value">{detail.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
