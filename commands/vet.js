const { SlashCommandBuilder } = require('@discordjs/builders');
const ranks = require('../config/ranks');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vet')
        .setDescription('Vets a user by removing the Awaiting Vetting role and adding them to the No Division group.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to vet')
                .setRequired(true)),

    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const awaitingVettingRole = interaction.guild.roles.cache.get(ranks.ROLES.AWAITING_VETTING);
        const noDivisionRole = interaction.guild.roles.cache.get(ranks.DIVISIONS['No Division']);

        if (!awaitingVettingRole || !noDivisionRole) {
            return interaction.reply({ content: 'One or both of the roles do not exist in this server.', ephemeral: true });
        }
        if (member.roles.cache.has(awaitingVettingRole.id)) {
            await member.roles.remove(awaitingVettingRole).catch(console.error);
        }
        if (!member.roles.cache.has(noDivisionRole.id)) {
            await member.roles.add(noDivisionRole).catch(console.error);
        }

        return interaction.reply({ content: `${member.user.tag} has been vetted and added to the No Division group.`, ephemeral: true });
    }
};
