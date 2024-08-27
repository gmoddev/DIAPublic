const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const ticketConfig = require('../config/ticketConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close-ticket')
        .setDescription('Close the current ticket channel.'),
    async execute(interaction) {
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({ content: 'This command can only be used in ticket channels.', ephemeral: true });
        }

        const ticketData = {
            users: [...interaction.channel.permissionOverwrites.cache.keys()],
            messages: []
        };

        interaction.channel.messages.fetch({ limit: 100 }).then(messages => {
            messages.reverse().forEach(message => {
                if (!message.author.bot) {
                    ticketData.messages.push({
                        author: message.author.tag,
                        content: message.content,
                        timestamp: message.createdAt.toISOString(),
                    });
                }
            });

            const ticketLogPath = path.join(__dirname, '..', 'logs', `${interaction.channel.name}.txt`);
            const ticketLogContent = `
Ticket: ${interaction.channel.name}
Created by: ${interaction.user.tag}
Users Involved: ${ticketData.users.join(', ')}

Messages:
${ticketData.messages.map(msg => `${msg.timestamp} - ${msg.author}: ${msg.content}`).join('\n')}
            `;

            fs.writeFileSync(ticketLogPath, ticketLogContent);

            const logChannel = interaction.guild.channels.cache.find(ch => ch.name === ticketConfig.logChannel);
            if (logChannel) {
                logChannel.send({ content: `Ticket closed: ${interaction.channel.name}`, files: [ticketLogPath] });
            }

            interaction.reply('Closing ticket...').then(() => {
                setTimeout(() => interaction.channel.delete(), 5000); // 5 secs
            });
        });
    },
};
