import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const data = await resend.emails.send({
            from: process.env.RESEND_FROM_SUPPORT_EMAIL, // Update this if you have a custom domain
            to,
            subject,
            html,
        });
        return data;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export const sendOTPEmail = async (email, otp, purpose) => {
    const subject =
        purpose === "email-verification"
            ? "Verify your email"
            : "Reset your password";

    const message =
        purpose === "email-verification"
            ? `Your email verification OTP is <b>${otp}</b>. It expires in 10 minutes.`
            : `Your password reset OTP is <b>${otp}</b>. It expires in 10 minutes.`;

    await resend.emails.send({
        from: process.env.RESEND_FROM_OTP_EMAIL,
        to: email,
        subject,
        html: `<p>${message}</p>`,
    });
};