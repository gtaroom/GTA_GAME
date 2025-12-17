import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userID');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Call your backend API to verify KYC status
    // Note: This should call your actual backend API endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    const response = await fetch(`${backendUrl}/user/verify-kyc-webhook?userID=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || 'KYC verification completed successfully',
        data: data.data || '/account'
      });
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'KYC verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('KYC webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
