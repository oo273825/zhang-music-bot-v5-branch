const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
	.setName("invite")
	.setDescription("邀請張先生去你家玩")
	.setRun(async (client, interaction, options) => {
		return interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setTitle(`邀請張先生去你家玩!`),
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton()
						.setLabel("邀請我")
						.setStyle("LINK")
						.setURL(
							`https://discord.com/oauth2/authorize?client_id=${
								client.config.clientId
							}&permissions=${
								client.config.permissions
							}&scope=${ client.config.scopes.toString().replace(/,/g, "%20") }`,
						),
				),
			],
		});
	});
module.exports = command;
