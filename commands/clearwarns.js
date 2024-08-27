const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../db/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-warns')
        .setDescription('Clear all warnings for a specific user.')
        .addUserOption(option => option.setName('user').setDescription('The user whose warnings should be cleared').setRequired(true)),
    async execute(interaction) {
        // REMINDER STRING TO ADD TO NEW PERMISSION SYSTEM
        const requiredRole = 'Leadership'; 

        if (!interaction.member.roles.cache.some(role => role.name === requiredRole)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        database.clearWarnings(user.id, (err, result) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'An error occurred while clearing the warnings.', ephemeral: true });
            }

            interaction.reply(`All warnings for ${user.tag} have been cleared.`);
        });
    },
};
