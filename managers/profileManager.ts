import { User } from 'discord.js';
import { profileScheme } from '../database/schemes/profileScheme';
import { Language } from '../structures/types';

export class ProfileManager {
    public user: User;

    constructor(user: User) {
        this.user = user;
    }

    async getProfile() {
        let profile = await profileScheme.findOne({ userId: this.user.id });
        if (!profile) profile = await this.create();
        return profile;
    }

    async create() {
        const profile = await profileScheme.create({
            userId: this.user.id,
            language: null
        });
        await profile.save().catch((err: Error) => console.log(err));
        return profile;
    }

    async getLanguage(): Promise<Language | null | undefined | string> {
        const profile = await profileScheme.findOne({ userId: this.user.id });
        if (!profile) return null;
        return profile.language;
    }

    async changeLanguage(language: Language) {
        const profile = await this.getProfile();
        await profile.updateOne({ language });
        await profile.save().catch((err: Error) => console.log(err));
    }
}
