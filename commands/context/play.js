const { ContextMenuCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const escapeMarkdown = require('discord.js').Util.escapeMarkdown;

module.exports = {
    command: new ContextMenuCommandBuilder().setName("Play Song").setType(3),

    /**
     * This function will handle context menu interaction
     * @param {import("../lib/DiscordMusicBot")} client
     * @param {import("discord.js").GuildContextMenuInteraction} interaction
     */
    run: async (client, interaction, options) => {
        let channel = await client.getChannel(client, interaction);
        if (!channel) {
            return;
        }

        let player;
        if (client.manager) {
            player = client.createPlayer(interaction.channel, channel);
        } else {
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription("Lavalink node 未連接"),
                ],
            });
        }

        if (player.state !== "CONNECTED") {
            player.connect();
        }

        if (channel.type == "GUILD_STAGE_VOICE") {
            setTimeout(() => {
                if (interaction.guild.me.voice.suppress == true) {
                    try {
                        interaction.guild.me.voice.setSuppressed(false);
                    } catch (e) {
                        interaction.guild.me.voice.setRequestToSpeak(true);
                    }
                }
            }, 2000); // Need this because discord api is buggy asf, and without this the bot will not request to speak on a stage - Darren
        }

        const ret = await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(client.config.embedColor)
                    .setDescription(":mag_right: **搜尋中...**"),
            ],
            fetchReply: true,
        });

        const query = (interaction.channel.messages.cache.get(interaction.targetId).content ?? await interaction.channel.messages.fetch(interaction.targetId));
        let res = await player.search(query, interaction.user).catch((err) => {
            client.error(err);
            return {
                loadType: "LOAD_FAILED",
            };
        });

        if (res.loadType === "LOAD_FAILED") {
            if (!player.queue.current) {
                player.destroy();
            }
            await interaction
                .editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription("搜尋錯誤"),
                    ],
                })
                .catch(this.warn);
        }

        if (res.loadType === "NO_MATCHES") {
            if (!player.queue.current) {
                player.destroy();
            }
            await interaction
                .editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription("無搜尋結果"),
                    ],
                })
                .catch(this.warn);
        }

        if (res.loadType === "TRACK_LOADED" || res.loadType === "SEARCH_RESULT") {
            player.queue.add(res.tracks[0]);

            if (!player.playing && !player.paused && !player.queue.size) {
                player.play();
            }
            var title = escapeMarkdown(res.tracks[0].title)
            var title = title.replace(/\]/g, "")
            var title = title.replace(/\[/g, "")
            let addQueueEmbed = new MessageEmbed()
                .setColor(client.config.embedColor)
                .setAuthor({ name: "加入隊列", iconURL: client.config.iconURL })
                .setDescription(
                    `[${title}](${res.tracks[0].uri})` || "No Title"
                )
                .setURL(res.tracks[0].uri)
                .addFields(
                    {
                        name: "點播者",
                        value: `<@${interaction.user.id}>`,
                        inline: true,
                    },
                    {
                        name: "歌曲時間",
                        value: res.tracks[0].isStream
                            ? `\`LIVE 🔴 \``
                            : `\`${client.ms(res.tracks[0].duration, {
                                colonNotation: true,
                                secondsDecimalDigits: 0,
                            })}\``,
                        inline: true,
                    }
                );

            try {
                addQueueEmbed.setThumbnail(
                    res.tracks[0].displayThumbnail("maxresdefault")
                );
            } catch (err) {
                addQueueEmbed.setThumbnail(res.tracks[0].thumbnail);
            }

            if (player.queue.totalSize > 1) {
                addQueueEmbed.addFields({
                    name: "隊列位置",
                    value: `${player.queue.size}`,
                    inline: true,
                });
            } else {
                player.queue.previous = player.queue.current;
            }

            await interaction.editReply({ embeds: [addQueueEmbed] }).catch(this.warn);
        }

        if (res.loadType === "PLAYLIST_LOADED") {
            player.queue.add(res.tracks);

            if (
                !player.playing &&
                !player.paused &&
                player.queue.totalSize === res.tracks.length
            ) {
                player.play();
            }

            let playlistEmbed = new MessageEmbed()
                .setColor(client.config.embedColor)
                .setAuthor({
                    name: "歌單加入隊列",
                    iconURL: client.config.iconURL,
                })
                .setThumbnail(res.tracks[0].thumbnail)
                .setDescription(`[${res.playlist.name}](${query})`)
                .addFields(
                    {
                        name: "加入隊列",
                        value: `\`${res.tracks.length}\` 首歌曲`,
                        inline: true,
                    },
                    {
                        name: "歌單時間",
                        value: `\`${client.ms(res.playlist.duration, {
                            colonNotation: true,
                            secondsDecimalDigits: 0,
                        })}\``,
                        inline: true,
                    }
                );

            await interaction.editReply({ embeds: [playlistEmbed] }).catch(this.warn);
        }

        if (ret) setTimeout(() => ret.delete().catch(this.warn), 20000);
        return ret;
    }
};
