import { http } from './http';
import { httpWithErrorHandling } from '../api-error-handler';
import type { 
	UserApiResponse, 
	ClaimBonusResponse, 
	ClaimDailyRewardResponse 
} from '@/types/user.types';

export type RegisterPayload = {
	name: {
		first: string;
		middle?: string;
		last: string;
	};
	email: string;
	password: string;
	phone?: string;
	state?: string;
	acceptSMSMarketing?: boolean;
	referralCode?: string;
};

export type LoginPayload = {
	email: string;
	password: string;
};

export function register(payload: RegisterPayload) {
	return http('/user/register', { method: 'POST', body: payload });
}

export function login(payload: LoginPayload) {
	return http('/user/login', { method: 'POST', body: payload });
}

// Auth check function - tries refresh token but doesn't redirect on failure
export function checkAuth() {
	return httpWithErrorHandling<UserApiResponse>('/user', { method: 'GET', cache: 'no-store' }, false, true);
}

// Regular user API - uses error handling for token refresh
export function me() {
	return httpWithErrorHandling<UserApiResponse>('/user', { method: 'GET', cache: 'no-store' });
}

export function logout() {
	return http('/user/logout', { method: 'POST' });
}

export function claimNewUserBonus() {
	return http<ClaimBonusResponse>('/claim/new-user-bonus', { method: 'POST' });
}

export function claimDailyReward() {
	return http<ClaimDailyRewardResponse>('/claim/daily-bonus', { method: 'POST' });
}

// OTP Verification APIs
export function verifyPhoneOTP(payload: { phone: string; otp: string }) {
	return http('/otp/verify-phone', { method: 'POST', body: payload });
}

export function resendPhoneOTP(payload: { phone: string }) {
	return http('/otp/resend-phone-verification', { method: 'POST', body: payload });
}

export function resendEmailVerification(payload: { email: string }) {
	return http('/user/resend-verification-email', { method: 'POST', body: payload });
}

// Password Reset APIs
export function forgotPassword(payload: { email: string }) {
	return http('/user/forgot-password', { method: 'POST', body: payload });
}

export function resetPassword(resetToken: string, payload: { password: string; confirmPassword: string }) {
	return http(`/user/reset-password/${resetToken}`, { method: 'POST', body: payload });
}

// Profile Management APIs
export function changePassword(payload: { oldPassword: string; newPassword: string }) {
	return http('/user/change-password', { method: 'POST', body: payload });
}

export function updateProfile(payload: Partial<{
	name: { first: string; middle?: string; last: string };
	phone: string;
	state: string;
	acceptSMSTerms: boolean;
	acceptSMSMarketing: boolean;
	isOpted: boolean;
	isSmsOpted: boolean;
}>) {
	return http('/user/update-profile', { method: 'PUT', body: payload });
}

export async function uploadAvatar(file: File) {
	const formData = new FormData();
	formData.append('avatar', file);

	// Use fetch directly for FormData upload
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
	const response = await fetch(`${baseUrl}/user/upload-avatar`, {
		method: 'POST',
		body: formData,
		credentials: 'include', // Important for cookies
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Upload failed' }));
		throw new Error(error.message || 'Failed to upload avatar');
	}

	return response.json();
}


