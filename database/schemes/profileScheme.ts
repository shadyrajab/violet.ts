import { model, Schema } from 'mongoose';

export const profileScheme = model(
  'Profile',
  new Schema({
    userId: { type: String },
    language: { type: String },
    premium: { type: Boolean },
    marriedWith: { type: String },
    lolAccount: { type: String },
    violets: { type: Number },
    experience: { type: Number },
    badges: { type: Array },
    playlists: { type: Array },
  }),
);
