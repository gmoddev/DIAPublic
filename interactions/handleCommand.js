const ranks = require('../config/ranks');
const DebugLogger = require('../utils/debugLogger');

module.exports = async function handleCommand(interaction, client) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        DebugLogger.log(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    if (!interaction.guild) {
        return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    }

    const coreGuildID = process.env.CORE_GUILD_ID;
    const coreGuild = client.guilds.cache.get(coreGuildID);

    if (!coreGuild) {
        DebugLogger.log(`Core server with ID ${coreGuildID} not found.`);
        return interaction.reply({ content: 'Core server not found. Please contact the administrator.', ephemeral: true });
    }

    const memberInCoreGuild = await coreGuild.members.fetch(interaction.user.id).catch(() => null);
    if (!memberInCoreGuild) {
        return interaction.reply({ content: 'You are not a member of the core server, so you cannot use this command.', ephemeral: true });
    }

    const requiredRoles = ranks.ADMIN_HIERARCHY.concat(ranks.DIV_LEADERS).map(role => ranks.ROLES[role]);

    const hasRequiredRole = requiredRoles.some(roleID => memberInCoreGuild.roles.cache.has(roleID));
    if (!hasRequiredRole) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    await command.execute(interaction);
};
