const { SlashCommandBuilder } = require('@discordjs/builders');
const ranks = require('../config/ranks');
const DebugLogger = require('../utils/debugLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-from-division')
        .setDescription('Remove a member from their division.')
        .addUserOption(option => option.setName('member').setDescription('The member to remove').setRequired(true)),
    
    async execute(interaction) {
        const coreGuildID = process.env.CORE_GUILD_ID;
        const coreGuild = interaction.client.guilds.cache.get(coreGuildID);
        const member = interaction.options.getUser('member');
        const memberInCoreGuild = await coreGuild.members.fetch(member.id);
        const userInCoreGuild = await coreGuild.members.fetch(interaction.user.id);

        let division = null;
        for (const [divisionName, roleID] of Object.entries(ranks.DIVISIONS)) {
            if (memberInCoreGuild.roles.cache.has(roleID)) {
                division = divisionName;
                break;
            }
        }

        if (!division) {
            return interaction.reply({ content: 'Member is not in any division.', ephemeral: true });
        }

        const isDivisionLead = userInCoreGuild.roles.cache.has(ranks.ROLES[ranks.DIV_LEADERS[division]]);
        const isAdmin = ranks.ADMIN_HIERARCHY.some(role => userInCoreGuild.roles.cache.has(ranks.ROLES[role]));

        if (!isDivisionLead && !isAdmin) {
            return interaction.reply({ content: 'You do not have permission to remove this member from their division.', ephemeral: true });
        }

        const divisionRole = coreGuild.roles.cache.get(ranks.DIVISIONS[division]);
        if (divisionRole) {
            await memberInCoreGuild.roles.remove(divisionRole);
            await interaction.reply(`${member.tag} has been removed from the ${division} division.`);
        } else {
            DebugLogger.log(`Division role ${division} not found in the core server.`);
            return interaction.reply({ content: `The division role ${division} could not be found.`, ephemeral: true });
        }
    }
};
