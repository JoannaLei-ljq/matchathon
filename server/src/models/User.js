import mongoose from 'mongoose';
import { cleanTags } from '../lib/tags.js';

const tagList = {
  type: [String],
  default: [],
  set: cleanTags,
  validate: {
    validator: (tags) => tags.length <= 20 && tags.every((t) => t.length <= 40),
    message: 'Use at most 20 tags of up to 40 characters each.',
  },
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'],
    },
    // Never returned by queries unless explicitly requested with .select('+passwordHash').
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50, default: '' },
    school: { type: String, trim: true, maxlength: 100, default: '' },
    location: { type: String, trim: true, maxlength: 100, default: '' },
    bio: { type: String, trim: true, maxlength: 500, default: '' },
    linkedin: { type: String, trim: true, maxlength: 200, default: '' },
    skills: tagList,
    interests: tagList,
    // Hackathons this user has signed up for. Matching only happens within one.
    hackathons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon' }],
  },
  { timestamps: true },
);

// "Who else is going to hackathon X?" is the core matching query.
userSchema.index({ hackathons: 1 });

userSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

// Fields other logged-in users may see. Email stays private.
export const PUBLIC_PROFILE_FIELDS = 'firstName lastName school location bio linkedin skills interests';

export const User = mongoose.model('User', userSchema);
