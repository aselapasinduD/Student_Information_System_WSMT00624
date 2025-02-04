const express = require('express');
const path = require('path');
const upload = require("./multer");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const fontKit = require("fontkit");

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
    for (let i = 0; i < students.length; i++) {
      const referralStudents = await read.getReferralStudents(students[i].id);
      const GoogleFormColor = await read.getGoogleFormsColor(students[i].id);
      students[i].referral_student = referralStudents;
      students[i].number_of_referrals = referralStudents.length;
      if (GoogleFormColor) {
        students[i].google_form_color = GoogleFormColor;
      }
    };
  }
  students.reverse();
  await makeStudent();
  res.status(200).json({ message: 'Get student success.', from: 'Main Server', body: students });
});
/**
 * 
 * @version 1.1.0
 * @since 1.0.0
 */
router.post('/student', upload.none(), async (req, res) => {
  const result = await create.addStudent(req.body);
  // console.log(req.body);
  if (result === 'ER_DUP_ENTRY') return res.status(200).json({ message: "Phone Number Duplicate Error!", from: 'Main Server', error: true });
  res.status(200).json({ message: result, from: 'Main Server' });
});
router.put('/student', upload.none(), async (req, res) => {
  // console.log(req.body);
  const result = await update.udpateStudent(req.body);
  // console.log(result);
  res.status(200).json({ message: result, from: 'Main Server' });
});
router.delete('/student', async (req, res) => {
  const result = await _delete.deleteStudent(req.body);
  // console.log(result);
  res.status(200).json({ message: result, from: 'Main Server' });
});
/**
 * 
 * @since 1.1.0
 */
router.delete('/student/detailscheck', async (req, res) => {
  const result = await update.udpateStudentDetailsCheck(req.body);
  // console.log(result);
  res.status(200).json({ message: result, from: 'Main Server' });
});

/**
 * APIs for Google Forms
 * 
 * @since 1.1.0
 */
router.post('/googleform', upload.none(), async (req, res) => {
  const result = await create.addGoogleForm(req.body);
  // if (result === 'ER_DUP_ENTRY') return res.status(200).json({message: "Phone Number Duplicate Error!", from: 'Main Server', error: true});
  res.status(200).json({ message: result, from: 'Main Server' });
});
router.get('/googleforms', async (req, res) => {
  const googleForms = await read.getGoogleForms();
  res.status(200).json({ message: 'Get google forms success.', from: 'Main Server', body: googleForms });
});
router.get('/googleforms/titles', async (req, res) => {
  const googleForms = await read.getGoogleFormsTitles();
  res.status(200).json({ message: 'Get google forms titles success.', from: 'Main Server', body: googleForms });
});
router.get('/googleform/code', async (req, res) => {
  const { id } = req.query;
  const googleFormSlug = await read.getGoogleFormSlug(id);
  const googleFormCode = `
    function sendDataToAPI(e) {
      const sheet = e.range.getSheet();
      const row = e.range.getRow();

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

      const apiUrl = '${process.env.AUTOMATION_SERVER_HOST}/api/${process.env.AUTOMATION_SERVER_ACCESS_KEY}/${googleFormSlug}/student';

      const payload = {
        student: {
          FullName: getDataByPartialHeader(headers, data, ['name']),
          Email: getDataByPartialHeader(headers, data, ['email address']),
          WANumber: "94" + parseInt(getDataByPartialHeader(headers, data, ['number'])).toString(),
          RegisterAt: getDataByPartialHeader(headers, data, ['timestamp'])
        }
      };

      // Add ReferralWA if it exists
      const referralNumber = getDataByPartialHeader(headers, data,['referral']);
      if (referralNumber && referralNumber.trim() !== '') {
        payload.student.ReferralWA = "94" + parseInt(referralNumber).toString();
      }

      // Add Address if it exists
      const address = getDataByPartialHeader(headers, data, ['address'], ['email']);
      if (address && address.trim() !== '') {
        payload.student.Address = address;
      }

      // Add ReceiptURL if it exists
      const receiptURL = getDataByPartialHeader(headers, data, ['upload']);
      if (receiptURL && receiptURL.trim() !== '') {
        payload.student.ReceiptURL = receiptURL;
      }

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
    }

    const getDataByPartialHeader = (headers, data, includeKeys, excludeKeys = []) => {
      if (typeof includeKeys === 'string') includeKeys = [includeKeys];
      if (typeof excludeKeys === 'string') excludeKeys = [excludeKeys];

      // Try to find an exact match first
      for (const includeKey of includeKeys) {
        const exactMatchIndex = headers.findIndex(header => {
          const headerLower = header.trim().toLowerCase();
          const includeLower = includeKey.toLowerCase();

          const isIncluded = headerLower === includeLower;

          const isExcluded = !isIncluded && excludeKeys.some(excludeKey => 
            headerLower.includes(excludeKey.toLowerCase())
          );
          return isIncluded || (headerLower.includes(includeLower) && !isExcluded);
        });
        if (exactMatchIndex !== -1) return data[exactMatchIndex];
      }

      // If no exact match, try partial matches
      for (const includeKey of includeKeys) {
        const partialMatchIndex = headers.findIndex(header => {
          const headerLower = header.trim().toLowerCase();
          const includeLower = includeKey.toLowerCase();

          const isIncluded = headerLower.includes(includeLower);

          const isExcluded = !isIncluded && excludeKeys.some(excludeKey => 
            headerLower.includes(excludeKey.toLowerCase())
          );
          return isIncluded && !isExcluded;
        });
        if (partialMatchIndex !== -1) return data[partialMatchIndex];
      }

      return null;
    };`
  res.status(200).json({ message: 'Get Google Form code success.', from: 'Main Server', body: googleFormCode });
});
router.get('/googleform/link', async (req, res) => {
  const { id } = req.query;
  const googleFormSlug = await read.getGoogleFormSlug(id);
  // console.log(googleFormSlug);
  const googleFormCodeLink = `${process.env.AUTOMATION_SERVER_HOST}/api/${process.env.AUTOMATION_SERVER_ACCESS_KEY}/${googleFormSlug}/student`;
  res.status(200).json({ message: 'Get google forms success.', from: 'Main Server', body: googleFormCodeLink });
});
router.put('/googleform', upload.none(), async (req, res) => {
  const result = await update.udpateGoogleForm(req.body);
  // console.log(req.body);
  res.status(200).json({ message: result, from: 'Main Server' });
});
router.delete('/googleform', async (req, res) => {
  const result = await _delete.deleteGoogleForm(req.body);
  // console.log(result);
  res.status(200).json({ message: result, from: 'Main Server' });
});

/**
 * APIs for Data Bundle Handles.
 * 
 * @since 1.1.0
 */
router.post('/bundles/process', upload.single("dataBundleFile"), async (req, res) => {
  console.log(req.file.path);
  const dataSet = await dataBundleHandle.processFile(req.file.path);
  res.status(200).json({ message: dataSet, from: 'Main Server' });
});
router.post('/bundles/import', upload.none(), async (req, res) => {
  const io = req.app.get('socket.io');
  const socketID = req.body.socketID;

  try {
    const dataBundleList = JSON.parse(req.body.bundleDataSetAsJSON);
    const columnPlaceholders = JSON.parse(req.body.columnPlaceholders);

    const updatedUserData = dataBundleList.map((student) => {
      const hasValidValues = Object.values(student).every((value) => value !== '');
      if (hasValidValues) {
        return columnPlaceholders.reduce((acc, id, index) => {
          if (id) {
            acc[id] = Object.values(student)[index];
            acc['googleFormID'] = req.body.googleForm;
            acc['registerDateToday'] = req.body.registerDateToday;
            acc['sendWelcomeEmail'] = req.body.sendWelcomeEmail;
          }
          return acc;
        }, {});
      }
      return null;
    })
      .filter((data) => data !== null);

    const totalStudents = updatedUserData.length;
    let progressCount = 0;

    if (totalStudents === 0) {
      return res.status(400).json({ message: 'No valid students to process.', from: 'Main Server', error: true });
    }

    io.to(socketID).emit('bundleImportProgress', { message: 'Processing started...', progress: 0 });

    for (const studentData of updatedUserData) {
      progressCount++;
      const progressPercentage = Math.round((progressCount / totalStudents) * 100);

      const result = await create.addFromBundleStudent(studentData);
      io.to(socketID).emit('bundleImportProgress', {
        message: `Processed student ${progressCount} of ${totalStudents}`,
        progress: progressPercentage,
      });
    }

    io.to(socketID).emit('bundleImportProgress', { message: 'Processing completed!', progress: 100 });
    return res.status(200).json({ message: 'All students processed successfully.', error: false, from: "Main Server" });
  } catch (error) {
    console.error('Error processing students:', error.message);
    return res.status(500).json({ message: 'An error occurred during processing.', error: true, from: "Main Server" });
  }
});

/**
 * APIs for Dashboard Handles.
 * 
 * @since 1.1.0
 */
router.get('/dashboard', async (req, res) => {
  const result = await read.getDashboardDataFromDB();
  console.log(result);
  return res.status(200).json({ message: 'All Dashboard Data Successfully.', error: false, from: "Main Server", body: result });
});

/**
 * APIs for PDF Generate.
 * 
 * @since 1.1.0
 */
const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

const chunkArray = (array, chunks) => {
  const result = [];
  const chunkSize = Math.ceil(array.length / chunks);

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    result.push(array.slice(start, end));
  }
  return result;
}

router.post('/generatepdfs', upload.single("uploadPDF"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No Any File Uploaded. Check your internet connection or try again.", error: true, from: "Main Server" });
    const listOfStudents = JSON.parse(req.body.selectedStudents).sort((a, b) => (a - b));

    if (!listOfStudents || listOfStudents.length === 0) return res.status(400).json({ message: "You need to select one or more students.", error: true, from: "Main Server" });

    let { placeholderAmount, addressLines, placeholderInsideGap, placeholdersGap, pdfPageActualSize, pdfFontWeight, pdfFontSize, pdfLineHeight } = JSON.parse(req.body.placeholderConfigurations);
    const placeholderPositions = JSON.parse(req.body.placeholderPositions);

    const pdfTemplatePath = req.file.path;
    const pdfTemplateBytes = fs.readFileSync(pdfTemplatePath);

    const PDFDOC = await PDFDocument.create();
    PDFDOC.registerFontkit(fontKit);
    const PDFFontByets = fs.readFileSync(path.join(__dirname, "../resources/fonts/", `pdf-font-${pdfFontWeight.toLowerCase() ?? "normal"}.ttf`));
    const PDFFont = await PDFDOC.embedFont(PDFFontByets);
    pdfFontSize = pdfFontSize ?? 14;
    const lineHeight = pdfFontSize * pdfLineHeight ?? 1;

    const PDFTEMPLATEDOC = await PDFDocument.load(pdfTemplateBytes);

    for (let i = 1; i <= Math.ceil(listOfStudents.length / placeholderPositions.length); i++) {
      const [pdfTemplatePage] = await PDFDOC.copyPages(PDFTEMPLATEDOC, [0]);
      const { width, height } = pdfTemplatePage.getSize();

      for (let index = 0; index < placeholderPositions.length; index++) {
        const studentIDsIndex = (i - 1) * placeholderPositions.length + index;
        if (listOfStudents.length <= studentIDsIndex) continue;

        const [{ full_name, address, wa_number }] = await read.getStudentById(listOfStudents[studentIDsIndex]);
        if (!address) continue;

        const formatedAddress = chunkArray(address.split(", "), addressLines)
          .filter(chunk => chunk.length > 0)
          .map(chunk => chunk.join(", "));

        const studentAddress = [`${full_name}`, formatedAddress, `${wa_number}`];

        const totalLines = studentAddress.reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 1), 0);
        const elementGaps = (studentAddress.length - 1) * placeholderInsideGap;
        const totalHeight = (totalLines * lineHeight) + elementGaps;

        let currentVerticalOffset = 0;

        // Draw each line of student information
        studentAddress.forEach((line) => {
          const lines = Array.isArray(line) ? line : [line];
          lines.forEach((text) => {
            pdfTemplatePage.drawText(text, {
              x: placeholderPositions[index].x,
              y: height - (pdfFontSize + placeholderPositions[index].y - totalHeight / 2) - currentVerticalOffset,
              font: PDFFont,
              size: pdfFontSize,
              color: rgb(0, 0, 0),
            });
            currentVerticalOffset += lineHeight;
          });
          currentVerticalOffset += placeholderInsideGap;
        });
        await update.udpateStudentStatus({id: listOfStudents[studentIDsIndex], status: 'GA'});
      }
      pdfTemplatePage.drawText(`Page ${i}`, {
        x: width - 50,
        y: height - 20,
        size: 12,
        color: rgb(0, 0, 0)
      });

      PDFDOC.addPage(pdfTemplatePage);
    }

    const PDFDOCBYETS = await PDFDOC.save();

    const uniqueSuffix = formattedDate + '-' + Math.round(Math.random() * 1E9);
    const generatePDFName = "generated-address-pdf-" + uniqueSuffix;
    const generatedPDFPath = path.join(__dirname, "../storage/PDFs", generatePDFName);

    fs.writeFileSync(generatedPDFPath, PDFDOCBYETS);

    res.download(generatedPDFPath, generatePDFName, (error) => {
      if (error) {
        console.error("Error Sending File: ", error);
        res.status(500).json({ message: "Error sending file! Try Again.", error: true, from: "Main Server" });
      }
      fs.unlinkSync(pdfTemplatePath);
      fs.unlinkSync(generatedPDFPath);
    });

  } catch (error) {
    const message = "Error processing PDF! Try Again."
    console.log(message, error);
    res.status(500).json({ message: message, error: true, from: "Main Server" });
  }
});

router.post('/generatecertificate', upload.single("uploadPDF"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No Any File Uploaded. Check your internet connection or try again.", error: true, from: "Main Server" });
    const listOfStudents = JSON.parse(req.body.selectedStudents).sort((a, b) => (a - b));

    if (!listOfStudents || listOfStudents.length === 0) return res.status(400).json({ message: "You need to select one or more students.", error: true, from: "Main Server" });

    let { pdfPageActualSize, pdfFontWeight, pdfFontSize, pdfTextTransform } = JSON.parse(req.body.placeholderConfigurations);
    const placeholderPositions = JSON.parse(req.body.placeholderPositions);

    const pdfTemplatePath = req.file.path;
    const pdfTemplateBytes = fs.readFileSync(pdfTemplatePath);

    const PDFDOC = await PDFDocument.create();
    PDFDOC.registerFontkit(fontKit);
    const PDFFontByets = fs.readFileSync(path.join(__dirname, "../resources/fonts/", `certificate-font-${pdfFontWeight.toLowerCase() ?? "normal"}.otf`));
    const PDFFont = await PDFDOC.embedFont(PDFFontByets);
    pdfFontSize = pdfFontSize ?? 14;

    const PDFTEMPLATEDOC = await PDFDocument.load(pdfTemplateBytes);

    for (let i = 1; i <= listOfStudents.length; i++) {
      const [pdfTemplatePage] = await PDFDOC.copyPages(PDFTEMPLATEDOC, [0]);
      const { width, height } = pdfTemplatePage.getSize();

      const studentID = listOfStudents[i - 1];
      const [{ full_name }] = await read.getStudentById(studentID);

      const listOfTextTransforms = ['Aa', 'AA', "aa"];
      let studentName = full_name;
      switch (listOfTextTransforms.indexOf(pdfTextTransform)) {
        case 0:
          studentName = studentName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
          break;
        case 1:
          studentName = studentName.toUpperCase();
          break;
        case 2:
          studentName = studentName.toLowerCase();
          break;
        default:
          studentName = studentName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      }

      const textWidth = PDFFont.widthOfTextAtSize(studentName, pdfFontSize);

      pdfTemplatePage.drawText(studentName, {
        x: placeholderPositions.x - (textWidth / 2),
        y: height - placeholderPositions.y - pdfFontSize,
        font: PDFFont,
        size: pdfFontSize,
        color: rgb(0, 0, 0)
      });

      PDFDOC.addPage(pdfTemplatePage);
      await update.udpateStudentStatus({id: studentID, status: 'GC'});
    }

    const PDFDOCBYETS = await PDFDOC.save();

    const uniqueSuffix = formattedDate + '-' + Math.round(Math.random() * 1E9);
    const generatePDFName = "generated-certificate-pdf-" + uniqueSuffix;
    const generatedPDFPath = path.join(__dirname, "../storage/PDFs", generatePDFName);

    fs.writeFileSync(generatedPDFPath, PDFDOCBYETS);

    res.download(generatedPDFPath, generatePDFName, (error) => {
      if (error) {
        console.error("Error Sending File: ", error);
        res.status(500).json({ message: "Error sending file: ", error: true, from: "Main Server" });
      }
      fs.unlinkSync(pdfTemplatePath);
      fs.unlinkSync(generatedPDFPath);
    });

  } catch (error) {
    const message = "Error processing PDF"
    console.log(message, error);
    res.status(500).json({ message: message, error: true, from: "Main Server" });
  }
});

module.exports = router;
