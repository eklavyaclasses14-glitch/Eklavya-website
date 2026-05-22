const fs = require('fs');
const path = require('path');
const dir = 'frontend/src/pages';

// 1. AdminAttendance.jsx & StaffAttendance.jsx
['AdminAttendance.jsx', 'StaffAttendance.jsx'].forEach(file => {
  let p = path.join(dir, file);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  let count = 0;
  content = content.replace(/htmlFor="admin-input"/g, () => 'htmlFor="admin-input-' + (++count) + '"');
  count = 0;
  content = content.replace(/id="admin-input"/g, () => 'id="admin-input-' + (++count) + '"');
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed ' + file);
});

// 2. AdminFees.jsx
let feesPath = path.join(dir, 'AdminFees.jsx');
if (fs.existsSync(feesPath)) {
  let content = fs.readFileSync(feesPath, 'utf8');
  let count2 = 0;
  content = content.replace(/id="([a-zA-Z_]+)"/g, (match, p1) => {
    count2++;
    return 'id="' + p1 + '-' + count2 + '"';
  });
  fs.writeFileSync(feesPath, content, 'utf8');
  console.log('Fixed AdminFees.jsx');
}

// 3. AdminManageDocuments.jsx
let docsPath = path.join(dir, 'AdminManageDocuments.jsx');
if (fs.existsSync(docsPath)) {
  let content = fs.readFileSync(docsPath, 'utf8');
  let count3 = 0;
  content = content.replace(/id="([a-zA-Z_]+)"/g, (match, p1) => {
    count3++;
    return 'id="' + p1 + '-' + count3 + '"';
  });
  fs.writeFileSync(docsPath, content, 'utf8');
  console.log('Fixed AdminManageDocuments.jsx');
}

// 4. AdminManageStudents.jsx
let studentsPath = path.join(dir, 'AdminManageStudents.jsx');
if (fs.existsSync(studentsPath)) {
  let content = fs.readFileSync(studentsPath, 'utf8');
  let count4 = 0;
  content = content.replace(/id="([a-zA-Z_]+)"/g, (match, p1) => {
    count4++;
    return 'id="' + p1 + '-' + count4 + '"';
  });
  fs.writeFileSync(studentsPath, content, 'utf8');
  console.log('Fixed AdminManageStudents.jsx');
}

// 5. AdminAddStudent.jsx
let addStudentPath = path.join(dir, 'AdminAddStudent.jsx');
if (fs.existsSync(addStudentPath)) {
  let content = fs.readFileSync(addStudentPath, 'utf8');
  let count5 = 0;
  content = content.replace(/id="([a-zA-Z_]+)"/g, (match, p1) => {
    count5++;
    return 'id="' + p1 + '-' + count5 + '"';
  });
  fs.writeFileSync(addStudentPath, content, 'utf8');
  console.log('Fixed AdminAddStudent.jsx');
}
