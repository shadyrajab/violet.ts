import { model, Schema } from 'mongoose';

export const guildScheme = model(
    'Guild',
    new Schema({
        serverId: { type: String },
        language: { type: String },
        categoryId: { type: String },
        channelId: { type: String },
    })
);
