const { MessageEmbed } = require("discord.js");
require("moment-duration-format");
const cpuStat = require("cpu-stat");
const moment = require("moment");
const SlashCommand = require("../../lib/SlashCommand");
const {
	Client,
	Interaction,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} = require("discord.js");
const LoadCommands = require("../../util/loadCommands");
const { filter } = require("lodash");

  SlashCommand: {
    /**
     *
     * @param {import("../structures/DiscordMusicBot")} client
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {*} param3
     */
    run: async (client, interaction) => {
      const { version } = require("discord.js");
      cpuStat.usagePercent(async function (err, percent, seconds) {
        if (err) {
          return console.log(err);
        }
        const duration = moment
          .duration(client.uptime)
          .format(" D[d], H[h], m[m]");

        let embede= new MessageEmbed()
      .setAuthor(
        "嗨你媽",
        "https://github.com/oo273825/zhang-music/blob/main/jammies.gif?raw=true"
      );
      message.channel.send(embede);
      });
      },
  },
};
module.exports = command;