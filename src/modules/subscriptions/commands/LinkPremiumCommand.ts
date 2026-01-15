import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandBase, CommandExecuteContext, CommandPermission } from '../../../shared/discord/CommandBase';
import { SubscriptionService } from '../services/SubscriptionService';
import { embedBuilder } from '../../../shared/embeds/EmbedBuilder';

@injectable()
export class LinkPremiumCommand extends CommandBase {
  readonly name = 'linkpremium';
  readonly description = '[DEV] Link premium subscription to this server';
  readonly permissions: CommandPermission[] = ['Administrator'];
  readonly guildOnly = true;

  constructor(
    @inject(SubscriptionService) private subscriptionService: SubscriptionService
  ) {
    super();
  }

  buildCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder;
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction } = context;
    const userId = interaction.user.id;
    const serverId = interaction.guildId!;

    await interaction.deferReply({ ephemeral: true });

    try {
      let subscription = await this.subscriptionService.getUserSubscription(userId);

      if (!subscription) {
        subscription = await this.subscriptionService.createFreeSubscription(userId);
      }

      if (!subscription.isPremium()) {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        await this.subscriptionService.upgradeToPremium(subscription.id, oneYearFromNow);
        subscription = (await this.subscriptionService.getUserSubscription(userId))!;
      }

      await this.subscriptionService.linkServerToSubscription(userId, serverId, subscription.id);

      await interaction.editReply({
        embeds: [
          embedBuilder.createSuccessEmbed(
            'Premium Linked',
            `This server is now linked to your Premium subscription.\n\n` +
            `**Plan:** ${subscription.planType}\n` +
            `**Status:** ${subscription.status}\n` +
            `**Expires:** ${subscription.currentPeriodEnd.toLocaleDateString()}`
          )
        ]
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          embedBuilder.createErrorEmbed(
            'Error Linking Premium',
            (error as Error).message
          )
        ]
      });
    }
  }
}
