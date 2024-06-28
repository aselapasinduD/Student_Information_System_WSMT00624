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
      students[i].number_of_referrals = referralStudents.length;
    };
  }
  students.reverse();
  await makeStudent();
  res.status(200).json({message: 'Get student success.', from: 'Main Server', body:students});
});
router.post('/student', async (req, res) => {
  const result = await create.addStudent(req.body);
  console.log(result);
  res.status(200).json({message: result, from: 'Main Server'});
});
router.put('/student', async (req, res) => {
  const result = await update.udpateStudent(req.body);
  console.log(result);
  res.status(200).json({message: result, from: 'Main Server'});
});
router.delete('/student', async (req, res) => {
  const result = await _delete.deleteStudent(req.body);
  console.log(result);
  res.status(200).json({message: result, from: 'Main Server'});
});

module.exports = router;
