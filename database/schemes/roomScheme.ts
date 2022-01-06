import { model, Schema } from 'mongoose';

export const roomScheme = model(
  'Room',
  new Schema({
    channelId: { type: String },
    owner: { type: String },
    admins: { type: Array },
  }),
);
