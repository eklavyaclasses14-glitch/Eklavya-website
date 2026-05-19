require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');
const Student = require('../backend/models/Student');
const Note = require('../backend/models/Note');
const Subject = require('../backend/models/Subject');

async function checkData() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const students = await Student.find().limit(5);
  console.log('\n--- Students ---');
  students.forEach(s => {
    console.log(`Name: ${s.name}, Dept: ${s.department}, Sem: ${s.semester}, ID: ${s._id}`);
  });

  const subjects = await Subject.find().limit(5);
  console.log('\n--- Subjects ---');
  subjects.forEach(s => {
    console.log(`Name: ${s.subject_name}, Dept: ${s.department}, Sem: ${s.semester}, ID: ${s._id}`);
  });

  const notes = await Note.find().limit(5);
  console.log('\n--- Notes ---');
  notes.forEach(n => {
    console.log(`Title: ${n.title}, SubjectID: ${n.subject_id}, ID: ${n._id}`);
  });

  await mongoose.disconnect();
}

checkData().catch(console.error);
