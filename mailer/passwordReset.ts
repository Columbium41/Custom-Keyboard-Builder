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

export const sendPasswordReset = async (email: string, token: string) => {
    const passwordResetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/password_reset?token=${token}`;

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body>
            <p>Somebody requested to reset your password, if you didn't request to reset your password please ignore this email. If you did request a password reset, please click on the following link below:</p>
            <a href="${passwordResetUrl}">${passwordResetUrl}</a>
        </body>
        </html>
    `;

    await transporter.sendMail({
        from: {
            name: 'Custom Keyboard Builder',
            address: process.env.EMAIL_USER as string,
        },
        to: email,
        subject: 'Password Reset - Custom Keyboard Builder',
        html: html,
    });
};
