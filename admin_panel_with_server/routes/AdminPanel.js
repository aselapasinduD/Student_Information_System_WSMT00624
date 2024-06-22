const express = require('express');
const path = require('path');

const router = express.Router();

const Read = require("../controllers/read");
const Create = require("../controllers/create");
const Update = require("../controllers/update");
const Delete = require("../controllers/delete");

const read = new Read();
const create = new Create();
const update = new Update();
const _delete = new Delete();

// Get admin panel static website.
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../admin_panel/build", "index.html"));
});

// APIs
router.get('/students', async (req, res) => {
  const students = await read.getStudents();
  const makeStudent = async () => {
    for(let i = 0; i < students.length; i++) {
      const referralStudents = await read.getReferralStudents(students[i].id);
      students[i].referral_student = referralStudents;
    };
  }
  await makeStudent();
  res.status(200).json({message: 'Get student success.', body:students});
});

router.post('/student', async (req, res) => {
  create.addStudent(req.body);
  console.log("Student Added Success.");
  res.status(200).json({message: 'Post student success.'});
});
router.put('/student', async (req, res) => {
  update.udpateStudent(req.body);
  console.log("Student Updated Success.");
  res.status(200).json({message: 'Put student success.'});
});
router.delete('/student/:id', async (req, res) => {
  _delete.deleteStudent(req.params);
  console.log("Student Deleted.");
  res.status(200).json({message: 'Delete student success.'});
});

module.exports = router;
