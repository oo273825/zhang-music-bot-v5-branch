const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
	.setName("move")
	.setDescription("將歌曲移到指定位置")
	.addIntegerOption((option) =>
		option
			.setName("track")
			.setDescription("The track number to move")
			.setRequired(true),
	)
	.addIntegerOption((option) =>
		option
			.setName("position")
			.setDescription("將歌曲移到指定位置")
			.setRequired(true),
	)
	
	.setRun(async (client, interaction) => {
		const track = interaction.options.getInteger("track");
		const position = interaction.options.getInteger("position");
		
		let channel = await client.getChannel(client, interaction);
		if (!channel) {
			return;
		}
		
		let player;
		if (client.manager) {
			player = client.manager.players.get(interaction.guild.id);
		} else {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("Lavalink node 未連接"),
				],
			});
		}
		
		if (!player) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("現在沒有播放的曲目..."),
				],
				ephemeral: true,
			});
		}
		
		let trackNum = Number(track) - 1;
		if (trackNum < 0 || trackNum > player.queue.length - 1) {
			return interaction.reply(":x: | **無效的曲目編號**");
		}
		
		let dest = Number(position) - 1;
		if (dest < 0 || dest > player.queue.length - 1) {
			return interaction.reply(":x: | **無效的目的**");
		}
		
		const thing = player.queue[trackNum];
		player.queue.splice(trackNum, 1);
		player.queue.splice(dest, 0, thing);
		return interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription(":white_check_mark: | **移動成功**"),
			],
		});
	});

module.exports = command;
