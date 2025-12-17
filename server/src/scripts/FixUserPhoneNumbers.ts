import mongoose from 'mongoose';
import UserModel from '../models/user.model';
import dotenv from "dotenv";
dotenv.config();
// Utility to clean and format phone numbers
function cleanAndFormatPhoneNumber(number: string): string | null {
  if (!number) return null;
  // Remove all non-digit characters
  let digits = number.replace(/\D/g, '');

  // If 10 digits, assume US and add +1
  if (digits.length === 10) {
    return '+1' + digits;
  }
  // If 11 digits and starts with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return '+1' + digits.slice(1);
  }
  // If 12 digits and starts with 11, remove extra 1 and add +
  if (digits.length === 12 && digits.startsWith('11')) {
    return '+1' + digits.slice(2);
  }
  // If already in +1XXXXXXXXXX format (with +)
  if (number.startsWith('+1') && digits.length === 11) {
    return '+1' + digits.slice(1);
  }
  // Otherwise, invalid
  return null;
}

async function fixAllUserPhoneNumbers() {
  await mongoose.connect(process.env.MONGODB_URI || '', { dbName: process.env.DB_NAME });
  const users = await UserModel.find({});
  let fixed = 0;
  let removed = 0;

  for (const user of users) {
    const original = user.phone;
    const formatted = cleanAndFormatPhoneNumber(original);
    if (formatted) {
      if (formatted !== original) {
        await UserModel.updateOne({ _id: user._id }, { phone: formatted });
        fixed++;
        console.log(`Fixed: ${original} -> ${formatted}`);
      }
    } else {
    await UserModel.updateOne({ _id: user._id }, { phone: '' });
      removed++;
      console.log(`Removed user invalid phone: ${original}`);
    }
  }

  console.log(`Done! Fixed: ${fixed}, Removed: ${removed}`);
  await mongoose.disconnect();
}

fixAllUserPhoneNumbers().catch(err => {
  console.error('Error fixing user phone numbers:', err);
  process.exit(1);
}); 