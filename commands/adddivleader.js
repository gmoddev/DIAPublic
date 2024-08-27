const { SlashCommandBuilder } = require('@discordjs/builders');
const ranks = require('../config/ranks');
const DebugLogger = require('../utils/debugLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assign-leader')
        .setDescription('Assign a leader to a division.')
        .addUserOption(option => option.setName('member').setDescription('The member to assign as leader').setRequired(true))
        .addStringOption(option => option.setName('division').setDescription('The division to assign the leader to').setRequired(true)),
    
    async execute(interaction) {
        const coreGuildID = process.env.CORE_GUILD_ID;
        const coreGuild = interaction.client.guilds.cache.get(coreGuildID);
        const member = interaction.options.getUser('member');
        const division = interaction.options.getString('division');
        const memberInCoreGuild = await coreGuild.members.fetch(member.id);
        const userInCoreGuild = await coreGuild.members.fetch(interaction.user.id);

        const isAdmin = ranks.ADMIN_HIERARCHY.some(role => userInCoreGuild.roles.cache.has(ranks.ROLES[role]));

        if (!isAdmin) {
            return interaction.reply({ content: 'You do not have permission to assign a division leader.', ephemeral: true });
        }

        const divisionRoleID = ranks.DIVISIONS[division];
        if (!divisionRoleID) {
            return interaction.reply({ content: 'Invalid division specified.', ephemeral: true });
        }

        const divisionRole = coreGuild.roles.cache.get(divisionRoleID);
        if (divisionRole) {
            const currentLeader = coreGuild.members.cache.find(member => member.roles.cache.has(divisionRoleID));
            if (currentLeader) {
                await currentLeader.roles.remove(divisionRole);
            }

            await memberInCoreGuild.roles.add(divisionRole);
            await interaction.reply(`${member.tag} has been assigned as the leader of the ${division} division.`);
        } else {
            DebugLogger.log(`Division role ${division} not found in the core server.`);
            return interaction.reply({ content: `The division role ${division} could not be found.`, ephemeral: true });
        }
    }
};
