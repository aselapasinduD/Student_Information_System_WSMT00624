const express = require('express');
const path = require('path');

const router = express.Router();

const Read = require("../controllers/read");
const Create = require("../controllers/create");

const read = new Read();
const create = new Create();

// Get admin panel static website.
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../admin_panel/build", "index.html"));
});


// APIs
router.get('/students', async (req, res) => {
  const students = await read.getStudents();
  res.status(200).json({message: 'Get student success.', body:students});
});

router.get('/students/referral-ids', async (req, res) => {
  const referralIds = await read.getReferralIDs();
  console.log("Geting referral IDs");
  res.status(200).json({message: 'Get referral IDs success.', body:referralIds});
});

router.post('/student', async (req, res) => {
  create.addStudent(req.body);
  console.log("Student Added Success.");
  res.status(200).json({message: 'Post student success.'});
});
router.put('/student', async (req, res) => {
  console.log("Student Updated Success.");
  res.status(200).json({message: 'Put student success.'});
})
router.delete('/student', async (req, res) => {
  console.log("Student Deleted.");
  res.status(200).json({message: 'Delete student success.'});
});

module.exports = router;
