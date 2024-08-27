const { SlashCommandBuilder } = require('@discordjs/builders');
const ranks = require('../config/ranks');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-to-division')
        .setDescription('Add a member to a division.')
        .addUserOption(option => option.setName('member').setDescription('The member to add').setRequired(true))
        .addStringOption(option => 
            option.setName('division')
                .setDescription('The division to add the member to')
                .setRequired(true)
                .addChoices(
                    { name: 'Secret Service', value: 'Secret Service' },
                    { name: 'Police Force', value: 'Police Force' },
                    { name: 'Military', value: 'Military' }
                )),
    
    async execute(interaction) {
        const coreGuildID = process.env.CORE_GUILD_ID;
        const coreGuild = interaction.client.guilds.cache.get(coreGuildID);
        const member = interaction.options.getUser('member');
        const division = interaction.options.getString('division');
        const memberInCoreGuild = await coreGuild.members.fetch(member.id);
        const userInCoreGuild = await coreGuild.members.fetch(interaction.user.id);

        const isAdmin = ranks.ADMIN_HIERARCHY.some(role => userInCoreGuild.roles.cache.has(ranks.ROLES[role]));

        if (!isAdmin) {
            return interaction.reply({ content: 'You do not have permission to add this member to a division.', ephemeral: true });
        }

        const noDivisionRole = coreGuild.roles.cache.get(ranks.DIVISIONS['No Division']);
        if (!noDivisionRole) {
            return interaction.reply({ content: 'The "No Division" role does not exist.', ephemeral: true });
        }

        if (!memberInCoreGuild.roles.cache.has(noDivisionRole.id)) {
            return interaction.reply({ content: `${member.tag} cannot be added to a division because they are already part of another division.`, ephemeral: true });
        }

        const divisionRoleID = ranks.DIVISIONS[division];
        if (!divisionRoleID) {
            return interaction.reply({ content: 'Invalid division specified.', ephemeral: true });
        }

        const divisionRole = coreGuild.roles.cache.get(divisionRoleID);
        if (divisionRole) {
            await memberInCoreGuild.roles.add(divisionRole);
            await memberInCoreGuild.roles.remove(noDivisionRole);
            await interaction.reply({ content: `${member.tag} has been added to the ${division} division.`, ephemeral: true });
        } else {
            console.error(`Division role ${division} not found in the core server.`);
            return interaction.reply({ content: `The division role ${division} could not be found.`, ephemeral: true });
        }
    }
};
