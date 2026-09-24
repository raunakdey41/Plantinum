import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// Brevo API Key provided by user
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

export async function POST(request: Request) {
  try {
    const { email, action } = await request.json();

    if (!email || !action) {
      return NextResponse.json({ error: 'Email and action are required' }, { status: 400 });
    }

    // Validate user existence based on action
    if (adminAuth) {
      try {
        const userRecord = await adminAuth.getUserByEmail(email);
        // If we reach here, the user exists.
        if (action === 'signup') {
          return NextResponse.json({ error: 'Account already exists. Please log in.' }, { status: 400 });
        }
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          // User does not exist
          if (action === 'reset') {
            return NextResponse.json({ error: 'No account found with this email.' }, { status: 400 });
          }
        } else {
          throw err;
        }
      }
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Firestore with expiration (e.g., 10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    if (adminDb) {
      await adminDb.collection('otps').doc(email).set({
        otp,
        expiresAt: expiresAt.getTime(),
        createdAt: Date.now(),
      });
    }

    // Send email via Brevo REST API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'Plantinum Store',
          email: 'info@plantinum.in'
        },
        to: [
          { email: email }
        ],
        subject: 'Your Plantinum Verification Code',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #223827;">Plantinum Store</h2>
            <p>Hello,</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f4f8f4; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #223827; margin: 0; letter-spacing: 4px;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo error:', errorData);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Error in send-otp:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
