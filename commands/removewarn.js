const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../db/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-warn')
        .setDescription('Remove a specific warning by its ID.')
        .addIntegerOption(option => option.setName('warn-id').setDescription('The ID of the warning to remove').setRequired(true)),
    async execute(interaction) {
        const requiredRole = 'Leadership';

        if (!interaction.member.roles.cache.some(role => role.name === requiredRole)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const warnId = interaction.options.getInteger('warn-id');

        database.removeWarning(warnId, (err, result) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'An error occurred while removing the warning.', ephemeral: true });
            }

            if (result.changes === 0) {
                return interaction.reply({ content: `Warning with ID ${warnId} does not exist.`, ephemeral: true });
            }

            interaction.reply(`Warning with ID ${warnId} has been removed.`);
        });
    },
};
