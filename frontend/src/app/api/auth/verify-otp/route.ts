import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, otp, password, action } = await request.json();

    if (!email || !otp || !password || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: 'Firebase Admin service unavailable' }, { status: 500 });
    }

    // Check OTP in Firestore
    const otpDoc = await adminDb.collection('otps').doc(email).get();

    if (!otpDoc.exists) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const otpData = otpDoc.data();
    
    if (!otpData) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }
    
    // Verify OTP matches
    if (otpData.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      await otpDoc.ref.delete();
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // OTP is valid. Now perform the requested action.
    let uid = '';

    if (action === 'signup') {
      try {
        // Create the user in Firebase
        const userRecord = await adminAuth.createUser({
          email,
          password,
        });
        uid = userRecord.uid;
      } catch (err: any) {
        if (err.code === 'auth/email-already-exists') {
          return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
        }
        throw err;
      }
    } else if (action === 'reset') {
      try {
        // Find user by email
        const userRecord = await adminAuth.getUserByEmail(email);
        uid = userRecord.uid;
        
        // Update their password
        await adminAuth.updateUser(uid, {
          password,
        });
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          return NextResponse.json({ error: 'No user found with this email' }, { status: 400 });
        }
        throw err;
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Delete the OTP document so it can't be reused
    await otpDoc.ref.delete();

    // Generate a custom token so the frontend can sign them in immediately
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ success: true, customToken });
  } catch (error: any) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
