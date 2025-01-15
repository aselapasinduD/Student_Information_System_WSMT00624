const express = require('express');
const path = require('path');
const upload = require("./multer");

const router = express.Router();
// const upload = multer();

const Read = require("../controllers/read");
const Create = require("../controllers/create");
const Update = require("../controllers/update");
const Delete = require("../controllers/delete");
const DataBundleHandle = require("../controllers/dataBundleHandle");

const read = new Read();
const create = new Create();
const update = new Update();
const _delete = new Delete();
const dataBundleHandle = new DataBundleHandle();

/**
 * API for handle Static Website
 * 
 * @since 1.0.0
 */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../admin_panel/build", "index.html"));
});

/**
 * @since 1.1.0
 */
router.get('/student', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../admin_panel/build", "index.html"));
});
router.get('/googlform', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../admin_panel/build", "index.html"));
});

/**
 * APIs for Students
 * 
 * @version 1.1.0
 * @since 1.0.0
 */
router.get('/students', async (req, res) => {
  const students = await read.getStudents();
  const makeStudent = async () => {
    for(let i = 0; i < students.length; i++) {
      const referralStudents = await read.getReferralStudents(students[i].id);
      const GoogleFormColor = await read.getGoogleFormsColor(students[i].id);
      students[i].referral_student = referralStudents;
      students[i].number_of_referrals = referralStudents.length;
      if(GoogleFormColor){
        students[i].google_form_color = GoogleFormColor;
      }
    };
  }
  students.reverse();
  await makeStudent();
  res.status(200).json({message: 'Get student success.', from: 'Main Server', body:students});
});
/**
 * 
 * @version 1.1.0
 * @since 1.0.0
 */
router.post('/student', upload.none(), async (req, res) => {
  const result = await create.addStudent(req.body);
  // console.log(req.body);
  if (result === 'ER_DUP_ENTRY') return res.status(200).json({message: "Phone Number Duplicate Error!", from: 'Main Server', error: true});
  res.status(200).json({message: result, from: 'Main Server'});
});
router.put('/student', upload.none(), async (req, res) => {
  // console.log(req.body);
  const result = await update.udpateStudent(req.body);
  // console.log(result);
  res.status(200).json({message: result, from: 'Main Server'});
});
router.delete('/student', async (req, res) => {
  const result = await _delete.deleteStudent(req.body);
  // console.log(result);
  res.status(200).json({message: result, from: 'Main Server'});
});
/**
 * 
 * @since 1.1.0
 */
router.delete('/student/detailscheck', async (req, res) => {
  const result = await update.udpateStudentDetailsCheck(req.body);
  // console.log(result);
  res.status(200).json({message: result, from: 'Main Server'});
});

/**
 * APIs for Google Forms
 * 
 * @since 1.1.0
 */
router.post('/googleform', upload.none() , async (req, res) => {
  const result = await create.addGoogleForm(req.body);
  // if (result === 'ER_DUP_ENTRY') return res.status(200).json({message: "Phone Number Duplicate Error!", from: 'Main Server', error: true});
  res.status(200).json({message: result, from: 'Main Server'});
});
router.get('/googleforms', async (req, res) => {
  const googleForms = await read.getGoogleForms();
  res.status(200).json({message: 'Get google forms success.', from: 'Main Server', body:googleForms});
});
router.get('/googleforms/titles', async (req, res) => {
  const googleForms = await read.getGoogleFormsTitles();
  res.status(200).json({message: 'Get google forms titles success.', from: 'Main Server', body:googleForms});
});
router.get('/googleform/code', async (req, res) => {
  const {id} = req.query;
  const googleFormSlug = await read.getGoogleFormSlug(id);
  const googleFormCode = `
    function sendDataToAPI(e) {
      const sheet = e.range.getSheet();
      const row = e.range.getRow();
      const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

      const apiUrl = '${process.env.AUTOMATION_SERVER_HOST}/api/${process.env.AUTOMATION_SERVER_ACCESS_KEY}/${googleFormSlug}/student';

      const referral_number = data[4] === ''? "" : "94" + parseInt(data[4]).toString();

      const payload = {
        student: {
          FullName: data[2],
          Email: data[1],
          WANumber: "94" + parseInt(data[3]).toString(),
          ReferralWA: referral_number,
          RegisterAt: data[0]
        }
      };

      const options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'SystemUser': '${process.env.AUTOMATION_SYSTEM_USER}',
          'Password': '${process.env.AUTOMATION_PASSWORD}',
          'Auth': 'false'
        },
        payload: JSON.stringify(payload),
      };

      try {
        const response = UrlFetchApp.fetch(apiUrl, options);
        Logger.log('Response Code: ' + response.getResponseCode());
        Logger.log('Response Content: ' + response.getContentText());
      } catch (error) {
        Logger.log('Error sending data to API: ' + error);
      }
    }

    function onFormSubmit(e) {
      sendDataToAPI(e);
    }`
  res.status(200).json({message: 'Get Google Form code success.', from: 'Main Server', body: googleFormCode});
});
router.get('/googleform/link', async (req, res) => {
  const {id} = req.query;
  const googleFormSlug = await read.getGoogleFormSlug(id);
  // console.log(googleFormSlug);
  const googleFormCodeLink = `${process.env.AUTOMATION_SERVER_HOST}/api/${process.env.AUTOMATION_SERVER_ACCESS_KEY}/${googleFormSlug}/student`;
  res.status(200).json({message: 'Get google forms success.', from: 'Main Server', body: googleFormCodeLink});
});
router.put('/googleform', upload.none() , async (req, res) => {
  const result = await update.udpateGoogleForm(req.body);
  // console.log(req.body);
  res.status(200).json({message: result, from: 'Main Server'});
});
router.delete('/googleform', async (req, res) => {
  const result = await _delete.deleteGoogleForm(req.body);
  // console.log(result);
  res.status(200).json({message: result, from: 'Main Server'});
});

/**
 * APIs for Data Bundle Handles.
 * 
 * @since 1.1.0
 */
router.post('/bundles/process', upload.single("dataBundleFile") , async (req, res) => {
  console.log(req.file.path);
  const dataSet = await dataBundleHandle.processFile(req.file.path);
  res.status(200).json({message: dataSet, from: 'Main Server'});
});
router.post('/bundles/import', upload.none(), async(req, res) => {
  // console.log(req.body);
  const dataBundleList = JSON.parse(req.body.bundleDataSetAsJSON);
  const socketID = req.body.socketID
  const totalItems = dataBundleList.length;
  let prograssCount = 0;

  const io = req.app.get("socket.io");

  const prograssInterval = setInterval(() => {
    prograssCount += 1;

    io.to(socketID).emit('bundleImportPrograss', Math.round((prograssCount / totalItems) * 100));

    if (prograssCount >= totalItems) {
      clearInterval(prograssInterval);
      res.status(200).json({message: "Submit is Working.", from: 'Main Server'});
    }
  }, totalItems / (1000 / 60));
});

module.exports = router;