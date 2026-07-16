const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('../models/Department');

dotenv.config();

const DEPARTMENTS = [
  'Automation & Robotics',
  'Automobile Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Computer Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Mechanical Engineering (CAD/CAM)',
  'Information & Communication Technology',
  'Metallurgy',
  'Power Electronics',
  'Architecture',
];

const DEPT_SHORT = {
  "Computer Engineering": "CSE",
  "Mechanical Engineering": "MECH",
  "Civil Engineering": "CIVIL",
  "Electrical Engineering": "EEE",
  "Automation & Robotics": "AUTO  & ROBOT",
  "Automobile Engineering": "AUTO",
  "Information Technology": "IT",
  "Mechanical Engineering (CAD/CAM)": "MECH( CAD/CAM )",
  "Information & Communication Technology": "ICT",
  "Metallurgy": "MET",
  "Power Electronics": "PE",
  "Architecture": "ARCH"
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    for (const name of DEPARTMENTS) {
      const short_name = DEPT_SHORT[name] || name;
      await Department.updateOne(
        { name },
        { $set: { name, short_name } },
        { upsert: true }
      );
    }
    
    console.log('Migration complete. Departments seeded.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
};

migrate();
