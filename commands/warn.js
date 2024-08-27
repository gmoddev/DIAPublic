const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../db/database');
const userLog = require('../logs/userLog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user and log it in the database.')
        .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        database.addWarning(user.id, user.tag, reason, (err, result) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'An error occurred while warning the user.', ephemeral: true });
            }

            userLog.logWarning(interaction.guild, interaction.member, user, reason);

            interaction.reply(`${user.tag} has been warned for: ${reason}. Warning ID: ${result.id}`);
        });
    },
};
