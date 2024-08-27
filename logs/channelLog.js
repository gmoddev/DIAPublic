const parser = require('../utils/parser');

module.exports = {
    logRoleChange(oldMember, newMember) {
        const coreGuildID = process.env.CORE_GUILD_ID;
        const channelName = 'role-change-logs';
        const filterRoles = (roles) => roles.filter(role => role.id !== newMember.guild.id);

        const oldRoles = filterRoles(oldMember.roles.cache).map(role => role.name).join(', ');
        const newRoles = filterRoles(newMember.roles.cache).map(role => role.name).join(', ');

        if (oldRoles !== newRoles) {
            const message = `User ${newMember.user.tag} (${newMember.id}) had a role change in ${newMember.guild.name}.\nOld Roles: ${oldRoles}\nNew Roles: ${newRoles}`;

            // CORE GUILD
            const coreGuild = oldMember.client.guilds.cache.get(coreGuildID);
            if (coreGuild) {
                const channel = coreGuild.channels.cache.find(ch => ch.name === channelName);
                if (channel) channel.send(message);
            }

            // SECONDARY GUILDS
            const secondaryGuildIDs = parser.parseGuildIDs('SECONDARY_GUILD_IDs');
            for (const guildID of secondaryGuildIDs) {
                const guild = oldMember.client.guilds.cache.get(guildID);
                if (guild) {
                    const channel = guild.channels.cache.find(ch => ch.name === channelName);
                    if (channel) channel.send(message);
                }
            }
        }
    },
};
