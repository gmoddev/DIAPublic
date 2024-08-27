const { SlashCommandBuilder } = require('@discordjs/builders');
const ranks = require('../config/ranks');
const DebugLogger = require('../utils/debugLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('demote')
        .setDescription('Demote a member within their division.')
        .addUserOption(option => option.setName('member').setDescription('The member to demote').setRequired(true)),
    
    async execute(interaction) {
        const coreGuildID = process.env.CORE_GUILD_ID;
        const coreGuild = interaction.client.guilds.cache.get(coreGuildID);
        const member = interaction.options.getUser('member');
        const memberInCoreGuild = await coreGuild.members.fetch(member.id);
        const userInCoreGuild = await coreGuild.members.fetch(interaction.user.id);

        let division = null;
        let previousRank = null;

        for (const [divisionName, roleID] of Object.entries(ranks.DIVISIONS)) {
            if (memberInCoreGuild.roles.cache.has(roleID)) {
                division = divisionName;
                const ranksList = ranks[`${divisionName.replace(' ', '_').toUpperCase()}_RANKS`];
                previousRank = ranksList[ranksList.indexOf(memberInCoreGuild.roles.highest.name) - 1];
                break;
            }
        }

        if (!division || !previousRank) {
            return interaction.reply({ content: 'Member is not in any division or is already at the lowest rank.', ephemeral: true });
        }

        const isDivisionLead = userInCoreGuild.roles.cache.has(ranks.ROLES[ranks.DIV_LEADERS[division]]);
        const isAdmin = ranks.ADMIN_HIERARCHY.some(role => userInCoreGuild.roles.cache.has(ranks.ROLES[role]));

        if (!isDivisionLead && !isAdmin) {
            return interaction.reply({ content: 'You do not have permission to demote this member.', ephemeral: true });
        }

        const previousRole = coreGuild.roles.cache.find(role => role.name === previousRank);
        if (previousRole) {
            await memberInCoreGuild.roles.add(previousRole);
            await interaction.reply(`${member.tag} has been demoted to ${previousRank} in the ${division} division.`);
        } else {
            DebugLogger.log(`Role ${previousRank} not found in the core server.`);
            return interaction.reply({ content: `The rank ${previousRank} could not be found.`, ephemeral: true });
        }
    }
};
