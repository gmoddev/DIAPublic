const messageLog = require('./messageLog');
const promotionLog = require('./promotionLog');
const userLog = require('./userLog');
const parser = require('../utils/parser');
const ranks = require('../config/ranks');
const { AuditLogEvent } = require('discord.js');

module.exports = (client) => {
    const coreGuildID = process.env.CORE_GUILD_ID;
    const secondaryGuildIDs = parser.parseGuildIDs('SECONDARY_GUILD_IDs');

    client.on('guildMemberAdd', async (member) => {
        userLog.logJoin(member);

        const awaitingVettingRole = member.guild.roles.cache.get(ranks.ROLES.AWAITING_VETTING);
        if (awaitingVettingRole) {
            await member.roles.add(awaitingVettingRole).catch(console.error);
        } else {
            console.error('AWAITINGVETTING role not found in the guild.');
        }
    });

    client.on('guildMemberRemove', member => {
        userLog.logLeave(member);
    });

    client.on('guildBanAdd', (ban) => {
        userLog.logBan(ban);
    });

    client.on('guildBanRemove', (ban) => {
        userLog.logUnban(ban);
    });

    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        if (oldMember.roles.cache.size < newMember.roles.cache.size) {
            const addedRole = newMember.roles.cache.find(role => !oldMember.roles.cache.has(role.id));
            
            const auditLogs = await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberRoleUpdate,
            });
            const roleLog = auditLogs.entries.first();

            if (roleLog && roleLog.executor.id !== client.user.id && roleLog.executor.id !== '271772941044285443') {
                await newMember.roles.remove(addedRole).catch(console.error);

                try {
                    const dmMessage = `You attempted to add the role **${addedRole.name}** to **${newMember.user.tag}**, but roles must be added via the bot.`;
                    await roleLog.executor.send(dmMessage);
                } catch (error) {
                    if (error.code === 50007) {
                        console.error(`Cannot send DM to user ${roleLog.executor.tag} (${roleLog.executor.id}). They might have DMs disabled or have blocked the bot.`);
                    } else {
                        console.error(`Failed to send DM to user ${roleLog.executor.tag} (${roleLog.executor.id}): ${error.message}`);
                    }
                }

                const logMessage = `User ${roleLog.executor.tag} (${roleLog.executor.id}) attempted to add the role **${addedRole.name}** to **${newMember.user.tag}** (${newMember.id}), but the role was removed and the user was notified.`;

                console.log(logMessage);

                const coreGuild = newMember.guild.client.guilds.cache.get(coreGuildID);
                if (coreGuild) {
                    const channel = coreGuild.channels.cache.find(ch => ch.name === 'message-logs');
                    if (channel) channel.send(logMessage);
                }

                for (const guildID of secondaryGuildIDs) {
                    const secondaryGuild = newMember.guild.client.guilds.cache.get(guildID);
                    if (secondaryGuild) {
                        const channel = secondaryGuild.channels.cache.find(ch => ch.name === 'message-logs');
                        if (channel) channel.send(logMessage);
                    }
                }
            }
        }
    });

    client.on('guildMemberKick', (member) => {
        userLog.logKick(member);
    });

    client.on('messageCreate', message => {
        if (message.author.bot) return;

        const badWords = ['badword1', 'badword2', 'badword3']; // reminder implement bad words or grab from database
        const lowerCaseMessage = message.content.toLowerCase();

        messageLog.logMessage(message.guild, message);

        for (const badWord of badWords) {
            if (lowerCaseMessage.includes(badWord)) {
                messageLog.logBadWordDetected(message.guild, message, badWord);
                message.delete();
                message.channel.send(`${message.author}, your message was removed due to inappropriate language.`);
                break;
            }
        }
    });
};
