import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize the SES client with the region
const sesClient = new SESClient({ region: process.env.AWS_REGION });

export const sendEmail = async (recommendations, email) => {
    const params = {
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Body: {
                Text: {
                    Data: recommendations,
                    Charset: 'UTF-8',
                },
            },
            Subject: {
                Data: 'Monthly Expense Recommendations',
                Charset: 'UTF-8',
            },
        },
        Source: process.env.SES_EMAIL_SENDER,
    };

    try {
        // Use the new SES `SendEmailCommand` and `send` method
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('Email sent successfully:', response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send recommendations email.');
    }
};