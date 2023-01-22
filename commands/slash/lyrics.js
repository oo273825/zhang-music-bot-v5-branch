const SlashCommand = require("../../lib/SlashCommand");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const api = require('lyrics-searcher-musixmatch').default

const command = new SlashCommand()
	.setName("lyrics")
	.setDescription("顯示當前歌曲的歌詞")
	.addStringOption((option) =>
		option
			.setName("song")
			.setDescription("顯示當前歌曲的歌詞")
			.setRequired(false),
	)
	.setRun(async (client, interaction, options) => {
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription("🔎 **搜尋中...**"),
			],
		});
		
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
		
		const args = interaction.options.getString("song");
		if (!args && !player) {
			return interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("沒有播放中的歌曲"),
				],
			});
		}
		
		let search = args? args : player.queue.current.title;
        api(search).then((lyrics) => {
		let text = lyrics.lyrics
		const button = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('tipsbutton')
					.setLabel('Tips')
					.setEmoji(`📌`)
					.setStyle('SECONDARY'),
				new MessageButton()
					.setLabel('Source')
					.setURL(lyrics.info.track.shareUrl)
					.setStyle('LINK'),
			);
		
		let lyricsEmbed = new MessageEmbed()
					.setColor(client.config.embedColor)
					.setTitle(`${ lyrics.info.track.name }`)
					.setURL(lyrics.info.track.shareUrl)
					.setThumbnail(lyrics.info.track.albumCoverart350x350)
                    .setFooter({ text: '歌詞由張井朧提供', iconURL: 'https://github.com/oo273825/zhang-music/blob/main/jam.gif?raw=true' })
					.setDescription(text);
		
		if (text.length > 4096) {
				text = text.substring(0, 4050) + "\n\n[...]";
				lyricsEmbed
					.setDescription(text + `\nTruncated, 歌詞太長了WTF.`)
			}

		return interaction.editReply({ 
				embeds: [lyricsEmbed],
				components: [button],
			
			});
		
		}) 
		.catch((err) => {	
		if (err.message == `未找到歌詞!`) {
			const button = new MessageActionRow()
			.addComponents(
				new MessageButton()
				    .setEmoji(`📌`)
				    .setCustomId('tipsbutton')
					.setLabel('Tips')
					.setStyle('SECONDARY'),
			);	

		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor("RED")
					.setDescription(
						`❌ | 未找到 ${ search } 的歌詞!`,
					),
			],
			components: [button],
		});
	} else {
		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor("RED")
					.setDescription(
						`❌ | 錯誤`,
					),
			],
		});
	};
});

const collector = interaction.channel.createMessageComponentCollector({time: 1000 * 3600 });

collector.on('collect', async i => {
	if (i.customId === 'tipsbutton') {
		await i.deferUpdate();
		await i.followUp({ 			
		embeds: [
			new MessageEmbed()
			    .setTitle(`Lyrics Tips`)
			    .setColor(client.config.embedColor)
				.setDescription(
					`Here is some tips to get your song lyrics correctly \n\n1. Try to add Artist name in front of the song name.\n2. Try to put the song name in the lyrics search box manually using your keyboard.\n3. Avoid using non english language when searching song lyrics, except the song itself doesnt use english language.`,
				),
		], ephemeral: true, components: [] });
	    };
    });
});

module.exports = command;
