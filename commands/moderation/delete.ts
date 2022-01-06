import { Client, VoiceChannel } from "discord.js";
import { GuildManager } from "../../structures/managers/guildManager";
import { Room } from "../../structures/managers/roomManager";
import { Command } from "../../structures/structures/command";
import { finished } from "../../translations/globalMessages";
import { notEnabled, pleaseSelect } from "../../translations/moderation/trdeleteMessages";

export class DeleteTRChannels extends Command {
    constructor(client: Client) {
        super(new Command({
            client: client,

            name: 'trdeletechannels',
            description: 'Moderation • Delete all the temporary channels created in this server.',
            permissions: ['ADMINISTRATOR'],
            options: [{
                name: 'channel',
                description: 'If you want to move the users to a new channel, what is the channel?',
                required: false,
                type: 'CHANNEL'
            }],
            
            execute: async (interaction, language) => {
                const guildManager = new GuildManager(interaction.guild!)
                const newChannel = interaction.options.getChannel('channel')
                const { trcategory, trchannel } = await guildManager.getTrChannels()
                if (!trcategory && !trchannel) return interaction.reply({
                    content: notEnabled(language),
                    ephemeral: true
                })
                if (newChannel && !(newChannel instanceof VoiceChannel)) return interaction.reply({
                    content: pleaseSelect(language),
                    ephemeral: true
                })
                else for (const channel of trcategory!.children) {
                    const voiceChannel = channel[1]
                    if (voiceChannel instanceof VoiceChannel && await Room.isRoom(voiceChannel)) {
                        if (newChannel) for (const member of voiceChannel.members) member[1].edit({channel: newChannel})
                        voiceChannel.delete(`Deleting all the temporary channels. Requested by: ${interaction.user.username}`) 
                    }
                }
                await interaction.reply({
                    content: finished(language),
                    ephemeral: true
                })
            }
        }))
    }
}