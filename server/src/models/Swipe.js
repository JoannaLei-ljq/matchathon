import mongoose from 'mongoose';

// One document per "from looked at to's card, at this hackathon, and decided".
// Keeping swipes in their own collection (instead of arrays on the user) means
// the user document stays small, and "did they like me back?" is one indexed lookup.
const swipeSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    action: { type: String, enum: ['like', 'pass'], required: true },
  },
  { timestamps: true },
);

// A person can only decide once per candidate per hackathon (re-swiping updates it).
swipeSchema.index({ from: 1, hackathon: 1, to: 1 }, { unique: true });
// Reverse lookup: who has liked `to` at this hackathon?
swipeSchema.index({ to: 1, hackathon: 1, action: 1 });

swipeSchema.set('toJSON', { versionKey: false });

export const Swipe = mongoose.model('Swipe', swipeSchema);
