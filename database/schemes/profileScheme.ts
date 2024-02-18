import { model, Schema } from 'mongoose';

export const profileScheme = model(
    'Profile',
    new Schema({
        userId: { type: String },
        language: { type: String },
    })
);
