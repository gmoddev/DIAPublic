const { SlashCommandBuilder } = require('@discordjs/builders');

// Note implement a Shell script for Windows

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restarts the bot.'),
    async execute(interaction) {
        const requiredRole = 'Leadership';

        if (!interaction.member.roles.cache.some(role => role.name === requiredRole)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        await interaction.reply({ content: 'Bot is restarting...', ephemeral: true });

        process.exit(0);
    },
};
