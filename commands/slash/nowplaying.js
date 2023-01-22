const { MessageEmbed } = require("discord.js");
const escapeMarkdown = require('discord.js').Util.escapeMarkdown;
const SlashCommand = require("../../lib/SlashCommand");
const prettyMilliseconds = require("pretty-ms");

const command = new SlashCommand()
	.setName("nowplaying")
	.setDescription("查看正在播放的歌曲")
	.setRun(async (client, interaction, options) => {
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
						.setDescription("我不在語音頻道中"),
				],
				ephemeral: true,
			});
		}
		
		if (!player.playing) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("現在沒有播放的曲目..."),
				],
				ephemeral: true,
			});
		}
		
		const song = player.queue.current;
        var title = escapeMarkdown(song.title)
        var title = title.replace(/\]/g,"")
        var title = title.replace(/\[/g,"")
		const embed = new MessageEmbed()
			.setColor(client.config.embedColor)
			.setAuthor({ name: "現正播放", iconURL: client.config.iconURL })
			// show who requested the song via setField, also show the duration of the song
			.setFields([
				{
					name: "點播者",
					value: `<@${ song.requester.id }>`,
					inline: true,
				},
				// show duration, if live show live
				{
					name: "歌曲時間",
					value: song.isStream
						? `\`LIVE\``
						: `\`${ prettyMilliseconds(player.position, {
							secondsDecimalDigits: 0,
						}) } / ${ prettyMilliseconds(song.duration, {
							secondsDecimalDigits: 0,
						}) }\``,
					inline: true,
				},
			])
			// show the thumbnail of the song using displayThumbnail("maxresdefault")
			.setThumbnail(song.displayThumbnail("maxresdefault"))
			// show the title of the song and link to it
			.setDescription(`[${ title }](${ song.uri })`);
		return interaction.reply({ embeds: [embed] });
	});
module.exports = command;
