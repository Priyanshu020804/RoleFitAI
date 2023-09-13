const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const { spawn } = require('child_process');

const fs = require('fs');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext); 
    }
});
const upload = multer({ storage: storage });

const app = express();
const cors = require('cors');
app.use(cors());

let isProcessing = false;
let jobDescriptionScore = null;
let FileName = '';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'hilton.marvin77@ethereal.email',
      pass: '63RVqAtTgCB3SHVdhv'
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/job_description_final', express.static(path.join(__dirname, 'job_description_final')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

app.get('/candidate', (req, res) => {
  const candidatePath = path.join(__dirname, 'public', 'candidate.html');
  res.sendFile(candidatePath);
});

app.get('/HrMain', (req, res) => {
  const HrMainPath = path.join(__dirname, 'public', 'HrMain.html');
  res.sendFile(HrMainPath);
});

app.get('/Hr', (req, res) => {
  const HrPath = path.join(__dirname, 'public', 'Hr.html');
  res.sendFile(HrPath);
});

app.get('/hrjobd', (req, res) => {
  const hrjobdPath = path.join(__dirname, 'public', 'hrjobd.html');
  res.sendFile(hrjobdPath);
});

app.get('/getJobDescriptionPDF', (req, res) => {
  const pdfPath = path.join(__dirname, 'job_description_final', 'your_pdf_file.pdf'); 
  res.sendFile(pdfPath);
});

app.get('/viewResume/:filename', (req, res) => {
  const resumeFilename = req.params.filename;
  const resumePath = path.join(__dirname, 'uploads', resumeFilename);
  res.sendFile(resumePath);
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Enter Your MySQL Database Password',
  database: 'Enter Your MySQL Database Name'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});


app.post('/addResume', upload.single('resume'), (req, res) => {
  const { name, age, email, contact } = req.body;
  const resumeFilename = req.file.filename;
  const pythonScript = path.join(__dirname, 'jdResume', 'main.py');
  const resumePath = path.join(__dirname, 'uploads', resumeFilename);
  const pythonProcess = spawn('python', [pythonScript, resumePath]);

  let outputData = '';

  pythonProcess.stdout.on('data', (data) => {
    outputData += data.toString();
    console.log(outputData)
  });
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });  
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      const score = parseFloat(outputData.trim());
      const insertQuery = 'INSERT INTO resume (name, age, email, contact, resume, score) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(insertQuery, [name, age, email, contact, resumeFilename, score], (err, results) => {
        if (err) {
          console.error('Error inserting student data:', err);
          return res.status(500).send('Error inserting student data');
        }
        res.status(200).send('Student data inserted successfully');
      });
    } else {
      console.error(`Python process exited with code ${code}`);
      res.status(500).send('Error processing resume');
    }
  });

});

app.get('/getResume', (req, res) => {

  const selectQuery = 'SELECT * FROM resume'; 

  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Error fetching student data:', err);
      res.status(500).send('Error fetching student data');
    } else {
      res.json(results);
    }
  });

});


app.post('/sendEmail', (req, res) => {
  const { selectedCandidates } = req.body;  

  if (!selectedCandidates || !Array.isArray(selectedCandidates)) {
    return res.status(400).send('Invalid request');
  }

  const emailPromises = selectedCandidates.map(candidate => {

    const mailOptions = {
      from: 'hilton.marvin77@ethereal.email',
      to: candidate.email, 
      subject: 'Shortlisted For Interview Round',
      text: `Hello, You have been shortlisted for the interview round.`
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          reject(error);
        } else {
          console.log('Email sent:', info.response);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          resolve(info);
        }
      });
    });

  });
  Promise.all(emailPromises)
    .then(() => {
      res.status(200).send('Emails sent successfully');
    })
    .catch(err => {
      res.status(500).send('Error sending emails');
    });
});


app.post('/uploadJobDescription', upload.single('jobd'), (req, res) => {

  isProcessing = true;
  const jobdFilename = req.file.filename;
  FileName=jobdFilename;
  const sourcePath = req.file.path;
  const targetPath = path.join(__dirname, 'job_description_upload', jobdFilename);
  const jobTitle = req.body.jobTitle;

  // Move the uploaded file to the target location
  fs.renameSync(sourcePath, targetPath);
  const pythonScript = path.join(__dirname, 'jdResume', 'jtjd.py');
  const jobdesPath = path.join(__dirname, 'job_description_upload', jobdFilename);
  const pythonProcess = spawn('python', [pythonScript, jobdesPath , jobTitle]);
  let outputData = '';

  pythonProcess.stdout.on('data', (data) => {
    outputData += data.toString();
    console.log(outputData)
  });
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      const score = parseFloat(outputData.trim());
      jobDescriptionScore = score;
      isProcessing = false;
    } else {
      console.error(`Python process exited with code ${code}`);
      res.status(500).send('Error processing resume');
    }
  });
  res.status(200).send('Job Title score calculated ');

});

app.post('/restoreOriginalJobDescription', upload.single('jobd'), (req, res) => {
  const jobdFilename = FileName;
  const sourcePath = path.join(__dirname, 'job_description_upload', jobdFilename);
  const targetPath = path.join(__dirname, 'job_description_final', 'jd.pdf');

  fs.copyFileSync(sourcePath, targetPath);
  res.status(200).send('Original Job Description Restored');
});


app.get('/checkProcessingStatus', (req, res) => {
  if (isProcessing) {
      res.json('processing');
  } else {
      res.json('done');
  }
});

app.get('/getScore', (req, res) => {
  if (jobDescriptionScore !== null) {
      res.json(jobDescriptionScore); // Send the score to the frontend
  } else {
      res.status(404).send('Score not available');
  }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
