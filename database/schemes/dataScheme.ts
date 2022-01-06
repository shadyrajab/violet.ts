import { model, Schema } from 'mongoose';

export const dataScheme = model(
  'Data',
  new Schema({
    id: { type: String },
    commands: { type: Object },
  }),
);
