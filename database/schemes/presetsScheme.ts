import { model, Schema } from 'mongoose';

export const presetScheme = model(
    'Preset',
    new Schema({
        userId: { type: String },
        presets: { type: Object },
    })
);
