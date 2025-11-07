interface MailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare const sendMail: (options: MailOptions) => Promise<void>;
export {};
//# sourceMappingURL=mailer.d.ts.map