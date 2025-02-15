require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const cheerio = require('cheerio');


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

const Email = mongoose.model('Email', emailSchema);

const fetchRandomLeetCodeQuestion = async () => {
  try {
    const response = await axios.get('https://leetcode.com/api/problems/all/');
    const problems = response.data.stat_status_pairs;

    if (!problems.length) throw new Error('No LeetCode problems found.');

    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    return {
      platform: "LeetCode",
      title: randomProblem.stat.question__title,
      url: `https://leetcode.com/problems/${randomProblem.stat.question__title_slug}/`,
      difficulty: randomProblem.difficulty.level === 1 ? "Easy" :
                  randomProblem.difficulty.level === 2 ? "Medium" : "Hard",
    };
  } catch (error) {
    console.error('Error fetching LeetCode question:', error.message);
    return null;
  }
};

const fetchRandomCodeforcesQuestion = async () => {
  try {
    const response = await axios.get('https://codeforces.com/api/problemset.problems');
    const problems = response.data.result.problems;

    if (!problems.length) throw new Error('No Codeforces problems found.');

    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    return {
      platform: "Codeforces",
      title: `${randomProblem.name} (${randomProblem.contestId}${randomProblem.index})`,
      url: `https://codeforces.com/contest/${randomProblem.contestId}/problem/${randomProblem.index}`,
      difficulty: randomProblem.rating ? `${randomProblem.rating} Rating` : "Unrated",
    };
  } catch (error) {
    console.error('Error fetching Codeforces question:', error.message);
    return null;
  }
};


const fetchRandomCodeChefQuestion = async () => {
  try {
    const response = await axios.get('https://www.codechef.com/practice/recent');
    const $ = cheerio.load(response.data);

    const problems = [];
    $('.MuiTableBody-root tr').each((index, element) => {
      const title = $(element).find('td:nth-child(1) a').text().trim();
      const url = $(element).find('td:nth-child(1) a').attr('href');
      const difficulty = $(element).find('td:nth-child(3)').text().trim();

      if (title && url) {
        problems.push({
          platform: 'CodeChef',
          title,
          url: `https://www.codechef.com${url}`,
          difficulty: difficulty || 'Unknown', 
        });
      }
    });

    if (problems.length === 0) throw new Error('No CodeChef problems found.');

    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    return randomProblem;
  } catch (error) {
    console.error('Error fetching CodeChef question:', error.message);
    return null;
  }
};



const fetchRandomQuestion = async () => {
  const sources = [fetchRandomLeetCodeQuestion, fetchRandomCodeforcesQuestion ];
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  return await randomSource();
};

const sendDailyProblemEmail = async () => {
  try {
    const emails = await Email.find({}, 'email');
    if (!emails.length) return console.log('No subscribers found.');

    const question = await fetchRandomQuestion();
    if (!question) return console.log('Failed to fetch a question.');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    for (let user of emails) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Your Daily ${question.platform} Coding Challenge`,
        html: `<h1>${question.platform} Question</h1>
               <p><strong>${question.title}</strong></p>
               <p>Difficulty: ${question.difficulty}</p>
               <p><a href="${question.url}" target="_blank">Solve this problem</a></p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error(`Error sending email to ${user.email}:`, error);
        else console.log(`Email sent to ${user.email}: ${info.response}`);
      });
    }
  } catch (error) {
    console.error('Error sending daily emails:', error);
  }
};

cron.schedule('30 3 * * *', () => {
  console.log('Running daily coding challenge email at 9:00 AM IST...');
  sendDailyProblemEmail();
}, { scheduled: true, timezone: 'Asia/Kolkata' });

app.post('/store-email', async (req, res) => {
  const { email, platform } = req.body; 
  if (!email || !platform) return res.status(400).send('Email and platform are required');

  let fetchQuestion;
  if (platform === "LeetCode") fetchQuestion = fetchRandomLeetCodeQuestion;   
  else if (platform === "Codeforces") fetchQuestion = fetchRandomCodeforcesQuestion;
  else if (platform === "Codechef") fetchQuestion = fetchRandomCodeChefQuestion;
  else return res.status(400).json({ status: 'failure', message: 'Invalid platform selected.' });
  try {
    const savedEmail = await Email.findOneAndUpdate(
      { email },
      { email },
      { upsert: true, new: true }
    );
    console.log(`Email saved: ${savedEmail.email}`);
    const question = await fetchQuestion();
    if (!question) return res.status(500).json({ status: 'failure', message: 'Failed to fetch a problem.' });

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Welcome!  ${platform} Question`,
      html: `<h1>${platform} Question</h1>
             <p><strong>${question.title}</strong></p>
             <p>Difficulty: ${question.difficulty}</p>
             <p><a href="${question.url}" target="_blank">Solve this problem</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ status: 'failure', message: 'Failed to send email.' });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).json({
          status: 'success',
          message: `Welcome email sent to ${email} with a ${platform} coding problem.`,
          data: question,
        });
      }
    });

  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).send('An error occurred while saving the email.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});  