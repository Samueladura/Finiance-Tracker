import { setGlobalOptions } from 'firebase-functions/v2/options';
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for Functions
setGlobalOptions({ maxInstances: 10 });

// Health check endpoint
export const healthCheck = onRequest((request, response) => {
  logger.info('Health check requested', { structuredData: true });
  response.status(200).send('OK');
});

// Hello world endpoint
export const helloWorld = onRequest((request, response) => {
  logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

// Send email on new contact message
export const sendContactEmail = onDocumentCreated('contactMessages/{docId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error('No data associated with the event', { docId: event.params.docId });
    return;
  }

  const data = snapshot.data() as {
    name?: string;
    email?: string;
    message?: string;
    timestamp?: Timestamp | Date | string;
  };
  logger.info('New contact message received', { data });

  // Validate required fields
  if (!data.name || !data.email || !data.message) {
    logger.error('Missing required fields in contact message', { data });
    return;
  }

  // Validate environment variables
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (!emailUser || !emailPass) {
    logger.error('Email credentials not configured', { emailUser: !!emailUser });
    throw new Error('Email credentials not configured');
  }

  // Create Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  // Format timestamp safely
  const timestamp = data.timestamp instanceof Timestamp
    ? data.timestamp.toDate().toISOString()
    : data.timestamp instanceof Date
    ? data.timestamp.toISOString()
    : typeof data.timestamp === 'string'
    ? data.timestamp
    : new Date().toISOString();

  const mailOptions = {
    from: emailUser,
    to: emailUser,
    subject: `New Contact Message from ${data.name}`,
    text: `
      Name: ${data.name}
      Email: ${data.email}
      Message: ${data.message}
      Sent at: ${timestamp}
    `,
    html: `
      <h3>New Contact Message</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Message:</strong> ${data.message}</p>
      <p><strong>Sent at:</strong> ${timestamp}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { email: data.email });
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error sending email:', { error: errorMessage });
    throw error;
  }
});