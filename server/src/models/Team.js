import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    name: { type: String, trim: true, maxlength: 60, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

// "Which team is this user on at this hackathon?" — a user is on at most one per hackathon.
teamSchema.index({ hackathon: 1, members: 1 });

teamSchema.set('toJSON', { versionKey: false });

export const Team = mongoose.model('Team', teamSchema);
