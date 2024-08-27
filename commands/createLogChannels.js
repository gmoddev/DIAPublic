const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-log-channels')
        .setDescription('Create all necessary log channels in a logs category.'),
    async execute(interaction) {
        const requiredRole = 'Leadership';

        if (!interaction.member.roles.cache.some(role => role.name === requiredRole)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        try {
            const guild = interaction.guild;

            if (!guild) {
                return interaction.reply({ content: 'This command can only be run in a server.', ephemeral: true });
            }

            let logsCategory = guild.channels.cache.find(channel => channel.name.toLowerCase() === 'logs' && channel.type === 4);

            if (!logsCategory) {
                logsCategory = await guild.channels.create({ name: 'Logs', type: 4 });
            }

            const logChannelNames = [
                'join-leave-logs',
                'role-change-logs',
                'kick-logs',
                'ban-logs',
                'promotion-logs',
                'warnings-log',
                'message-logs',
            ];

            for (const name of logChannelNames) {
                if (!guild.channels.cache.some(channel => channel.name === name)) {
                    await guild.channels.create({
                        name: name,
                        type: 0,
                        parent: logsCategory.id,
                    });
                }
            }

            await interaction.reply('Log channels created successfully in the Logs category!');
        } catch (error) {
            console.error('Error creating log channels:', error);
            await interaction.reply({ content: 'An error occurred while creating log channels.', ephemeral: true });
        }
    },
};
