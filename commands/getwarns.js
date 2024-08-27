const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../db/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-warnings')
        .setDescription('Retrieve all warnings for a specific user.')
        .addUserOption(option => option.setName('user').setDescription('The user whose warnings you want to retrieve').setRequired(true)),
    async execute(interaction) {
        // REMINDER TO MOVE TO NEW PERMISSION SYSTEM
        const requiredRoles = ['Officer', 'Leadership'];

        if (!interaction.member.roles.cache.some(role => requiredRoles.includes(role.name))) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        database.getWarnings(user.id, (err, warnings) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'An error occurred while retrieving the warnings.', ephemeral: true });
            }

            if (warnings.length === 0) {
                return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
            }

            const warningsList = warnings.map(warning => `**ID:** ${warning.id} | **Reason:** ${warning.reason} | **Date:** ${new Date(warning.timestamp).toLocaleString()}`).join('\n');

            interaction.reply(`Warnings for **${user.tag}**:\n${warningsList}`);
        });
    },
};
