const nodemailer = require('nodemailer');

const createTransporter = async () => {
  const ip = await new Promise((resolve) => {
    require('dns').resolve4('smtp.gmail.com', (err, addresses) => {
      if (err || !addresses || addresses.length === 0) resolve('smtp.gmail.com');
      else resolve(addresses[0]);
    });
  });

  return nodemailer.createTransport({
    host: ip,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
      servername: 'smtp.gmail.com'
    }
  });
};

const sendDeletionEmail = async (toEmail, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('⚠️ Email credentials missing in .env! Bypassing actual email send.');
    console.warn('🔗 TEST OTP LOCALLY: ', otp);
    return { success: true, mocked: true };
  }

  const transporter = await createTransporter();

  const mailOptions = {
    from: `"SkillLens Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Confirm Account Deletion - SkillLens',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ef4444;">Account Deletion OTP</h2>
        <p>Hello,</p>
        <p>We received a request to permanently delete your SkillLens account. This action is <strong>irreversible</strong> and will result in the loss of all your documents, study notes, flashcards, and quizzes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>Your One-Time Password (OTP) for account deletion is:</p>
        <div style="margin: 30px 0; text-align: center;">
          <span style="background-color: #f3f4f6; color: #1f2937; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 32px; letter-spacing: 4px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This OTP will expire in 15 minutes.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">Thank you for trying SkillLens.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

const sendRegistrationEmail = async (toEmail, otp) => {
  return sendGenericOTPEmail(toEmail, otp, 'Verify your SkillLens Registration');
};

const sendPasswordResetEmail = async (toEmail, otp) => {
  return sendGenericOTPEmail(toEmail, otp, 'Reset your SkillLens Password');
};

const sendGenericOTPEmail = async (toEmail, otp, subject) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('⚠️ Email credentials missing in .env! Bypassing actual email send.');
    console.warn('🔗 TEST OTP LOCALLY: ', otp);
    return { success: true, mocked: true };
  }

  const transporter = await createTransporter();

  const mailOptions = {
    from: `"SkillLens Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">${subject}</h2>
        <p>Hello,</p>
        <p>Please use the following One-Time Password (OTP) to complete your request:</p>
        <div style="margin: 30px 0; text-align: center;">
          <span style="background-color: #f3f4f6; color: #1f2937; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 32px; letter-spacing: 4px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This OTP will expire in 15 minutes.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">Thank you for using SkillLens.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendDeletionEmail,
  sendRegistrationEmail,
  sendPasswordResetEmail
};
