import {
  Client, CommandInteraction, Message, MessageEmbed, User,
} from 'discord.js';
import { profileScheme } from '../../database/schemes/profileScheme';
import { Language, BadgeName, Badge } from '../structures/types';
import {
  acquisitionDate,
  alreadyHave,
  belongsTo,
  description,
  negociable,
  newBadge,
} from '../../translations/community/badgesMessages';

const badges = require('../../database/badges.json');

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
      language: null,
      premium: false,
      marriedWith: null,
      lolAccount: null,
      violets: 0,
      badges: [],
    });
    await profile.save().catch((err: Error) => console.log(err));
    return profile;
  }

  async getLanguage(): Promise <Language | null> {
    const profile = await profileScheme.findOne({ userId: this.user.id });
    if (!profile) return null;
    return profile.language;
  }

  async getPremium(): Promise <boolean | undefined> {
    const profile = await profileScheme.findOne({ userId: this.user.id });
    if (!profile) return;
    return profile.premium;
  }

  async marriedWith(): Promise <boolean | undefined> {
    const profile = await profileScheme.findOne({ userId: this.user.id });
    if (!profile) return;
    return profile.marriedWith;
  }

  async getBadges(): Promise <Array <Badge | any>> {
    const profile = await profileScheme.findOne({ userId: this.user.id });
    if (!profile) return [];
    return profile.badges;
  }

  async addBadge(badgeName: BadgeName, message: Message | CommandInteraction, user: User, language: Language, client: Client) {
    const profile = await this.getProfile();
    const userBadges = profile.badges;
    const date = new Date();
    const formatedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    if (userBadges.find((badge: Badge) => badge.name === badgeName)) {
      if (message && language && client) return message.reply({ content: alreadyHave(language), ephemeral: true });
      return;
    }
    userBadges.push({ name: badgeName, date: formatedDate });
    await profile.save().catch((err: Error) => console.log(err));
    if (message && language && client) {
      const tierEmoji = client.emojis.cache.get('923300853035712522');
      const embed = new MessageEmbed()
        .setTitle(`${client.emojis.cache.get(badges[badgeName].badgeID)} ${badgeName}`)
        .setColor(badges[badgeName].badgeColor)
        .setThumbnail(badges[badgeName].badgeIcon)
        .addField(acquisitionDate(language), formatedDate, true)
        .addField(`${tierEmoji} Tier`, `\`${badges[badgeName].badgeType}\``, true)
        .addField(negociable(language, client), `${badges[badgeName].negociable}`, true)
        .addField(description(language), badges[badgeName].description[language], false)
        .setImage(badges[badgeName].badgeFooter)
        .setFooter(`${belongsTo(language)} ${user.username}`, user.displayAvatarURL());
      return message.reply({ content: newBadge(language, user), embeds: [embed] });
    }
  }

  async changeLanguage(language: Language) {
    const profile = await this.getProfile();
    await profile.updateOne({ language });
    await profile.save().catch((err: Error) => console.log(err));
  }
}
