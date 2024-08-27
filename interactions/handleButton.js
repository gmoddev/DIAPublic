
module.exports = async function handleButton(interaction, client) {
    if (interaction.customId === 'create_ticket') {
        const ticketConfig = require('../config/ticketConfig');
        const category = interaction.guild.channels.cache.find(c => c.name === ticketConfig.ticketCategory && c.type === 4); // 4 is the category type

        if (!category) {
            return interaction.reply({ content: `Category ${ticketConfig.ticketCategory} does not exist. Please contact an admin.`, ephemeral: true });
        }

        const existingChannel = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
        if (existingChannel) {
            return interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });
        }

        const ticketChannel = await interaction.guild.channels.create(`ticket-${interaction.user.id}`, {
            type: 0,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: interaction.user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                },
                ...ticketConfig.supportRoles.map(role => ({
                    id: interaction.guild.roles.cache.find(r => r.name === role).id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                })),
            ],
        });

        const ticketData = {
            users: new Set(),
            messages: [],
        };

        client.on('messageCreate', message => {
            if (message.channel.id === ticketChannel.id && !message.author.bot) {
                ticketData.users.add(message.author.tag);
                ticketData.messages.push({
                    author: message.author.tag,
                    content: message.content,
                    timestamp: message.createdAt.toISOString()
                });
            }
        });

        await ticketChannel.send(`Hello ${interaction.user}, support will be with you shortly.`);

        const logChannel = interaction.guild.channels.cache.find(ch => ch.name === ticketConfig.logChannel);
        if (logChannel) {
            logChannel.send(`Ticket created: ${ticketChannel.name} by ${interaction.user.tag}`);
        }

        return interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
    }
};
