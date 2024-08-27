const { EmbedBuilder } = require('discord.js');
const parser = require('../utils/parser');

module.exports = {
    logMessage(guild, message) {
        const coreGuildID = process.env.CORE_GUILD_ID;
        const channelName = 'message-logs';

        const embed = new EmbedBuilder()
            .setTitle(`${message.author.tag}`)
            .addFields(
                { name: 'User ID', value: String(message.author.id), inline: true },
                { name: 'Channel', value: `<#${String(message.channel.id)}>`, inline: true },
                { name: 'Message', value: this.cleanContent(message) || 'No content', inline: false }
            )
            .setTimestamp();

        const coreGuild = guild.client.guilds.cache.get(coreGuildID);
        if (coreGuild) {
            const channel = coreGuild.channels.cache.find(ch => ch.name === channelName);
            if (channel) channel.send({ embeds: [embed] });
        }

        const secondaryGuildIDs = parser.parseGuildIDs('SECONDARY_GUILD_IDs');
        for (const guildID of secondaryGuildIDs) {
            const secondaryGuild = guild.client.guilds.cache.get(guildID);
            if (secondaryGuild) {
                const channel = secondaryGuild.channels.cache.find(ch => ch.name === channelName);
                if (channel) channel.send({ embeds: [embed] });
            }
        }
    },

    logBadWordDetected(guild, message, badWord) {
        const coreGuildID = process.env.CORE_GUILD_ID;
        const channelName = 'message-logs';

        const embed = new EmbedBuilder()
            .setTitle(`Bad Word Detected by ${message.author.tag}`)
            .addFields(
                { name: 'User ID', value: String(message.author.id), inline: true },
                { name: 'Channel', value: `<#${String(message.channel.id)}>`, inline: true },
                { name: 'Message', value: this.cleanContent(message) || 'No content', inline: false },
                { name: 'Bad Word', value: badWord, inline: true }
            )
            .setTimestamp()
            .setColor('RED');

        const coreGuild = guild.client.guilds.cache.get(coreGuildID);
        if (coreGuild) {
            const channel = coreGuild.channels.cache.find(ch => ch.name === channelName);
            if (channel) channel.send({ embeds: [embed] });
        }

        const secondaryGuildIDs = parser.parseGuildIDs('SECONDARY_GUILD_IDs');
        for (const guildID of secondaryGuildIDs) {
            const secondaryGuild = guild.client.guilds.cache.get(guildID);
            if (secondaryGuild) {
                const channel = secondaryGuild.channels.cache.find(ch => ch.name === channelName);
                if (channel) channel.send({ embeds: [embed] });
            }
        }
    },
    // Clean content like @everyone
    cleanContent(message) {
        return message.content ? message.content.replace(/<@!?(\d+)>/g, (match, userId) => {
            const user = message.guild.members.cache.get(userId);
            return user ? `${user.user.tag} (${userId})` : match;
        }) : 'No content';
    },
};
