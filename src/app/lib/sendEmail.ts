import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function sendEmail(to: string, subject: string, text: string) {
  await transporter.sendMail({
    to,
    subject,
    text,
    from: process.env.EMAIL_USER,
  });
}
