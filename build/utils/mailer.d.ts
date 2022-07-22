interface MailOptions {
    email: string;
    subject: string;
    message: string;
}
export default function sendEMail(mailOptions: MailOptions): Promise<boolean>;
export {};
