import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmailVerification = async (email: string, token: string) => {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify_email?token=${token}`;

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body>
            <p>Welcome to MechForum, please verify your email to start using your account by clicking the link below:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
        </body>
        </html>
    `;

    await transporter.sendMail({
        from: {
            name: 'MechForum',
            address: process.env.EMAIL_USER as string,
        },
        to: email,
        subject: 'Verify Your Email - MechForum',
        html: html,
    });
};
