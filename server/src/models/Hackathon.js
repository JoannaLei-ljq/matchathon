import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    location: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    maxTeamSize: { type: Number, min: 2, max: 10, default: 4 },
  },
  { timestamps: true },
);

hackathonSchema.index({ startsAt: 1 });

hackathonSchema.set('toJSON', { versionKey: false });

export const Hackathon = mongoose.model('Hackathon', hackathonSchema);
