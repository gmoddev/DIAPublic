const { SlashCommandBuilder } = require('@discordjs/builders');
const ranks = require('../config/ranks');
const DebugLogger = require('../utils/debugLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Promote a member within their division.')
        .addUserOption(option => option.setName('member').setDescription('The member to promote').setRequired(true)),
    
    async execute(interaction) {
        const coreGuildID = process.env.CORE_GUILD_ID;
        const coreGuild = interaction.client.guilds.cache.get(coreGuildID);
        const member = interaction.options.getUser('member');
        const memberInCoreGuild = await coreGuild.members.fetch(member.id);
        const userInCoreGuild = await coreGuild.members.fetch(interaction.user.id);

        let division = null;
        let nextRank = null;

        for (const [divisionName, roleID] of Object.entries(ranks.DIVISIONS)) {
            if (memberInCoreGuild.roles.cache.has(roleID)) {
                division = divisionName;
                const ranksList = ranks[`${divisionName.replace(' ', '_').toUpperCase()}_RANKS`];
                nextRank = ranksList[ranksList.indexOf(memberInCoreGuild.roles.highest.name) + 1];
                break;
            }
        }

        if (!division || !nextRank) {
            return interaction.reply({ content: 'Member is not in any division or is already at the highest rank.', ephemeral: true });
        }

        const isDivisionLead = userInCoreGuild.roles.cache.has(ranks.ROLES[ranks.DIV_LEADERS[division]]);
        const isAdmin = ranks.ADMIN_HIERARCHY.some(role => userInCoreGuild.roles.cache.has(ranks.ROLES[role]));

        if (!isDivisionLead && !isAdmin) {
            return interaction.reply({ content: 'You do not have permission to promote this member.', ephemeral: true });
        }

        const nextRole = coreGuild.roles.cache.find(role => role.name === nextRank);
        if (nextRole) {
            await memberInCoreGuild.roles.add(nextRole);
            await interaction.reply(`${member.tag} has been promoted to ${nextRank} in the ${division} division.`);
        } else {
            DebugLogger.log(`Role ${nextRank} not found in the core server.`);
            return interaction.reply({ content: `The rank ${nextRank} could not be found.`, ephemeral: true });
        }
    }
};
