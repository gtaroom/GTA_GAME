/**
 * Format phone number to E.164 format for SMS APIs
 */
export const formatPhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber) return null;

  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If already in E.164 format (starts with +), return as is
  if (cleaned.startsWith('+')) {
    // Validate it has at least 10 digits after +
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      return cleaned;
    }
    return null;
  }

  // Handle US numbers (most common case)
  if (cleaned.length === 10) {
    // 10 digits: add +1 prefix
    return '+1' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // 11 digits starting with 1: add + prefix
    return '+' + cleaned;
  } else if (cleaned.length > 11) {
    // International number without country code
    // For now, assume it's a US number and add +1
    // You might want to add more sophisticated country code detection
    console.warn(`Phone number may need country code: ${phoneNumber}`);
    return '+1' + cleaned;
  }

  // Invalid format
  console.error(`Invalid phone number format: ${phoneNumber}`);
  return null;
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const formatted = formatPhoneNumber(phoneNumber);
  return formatted !== null;
}; 