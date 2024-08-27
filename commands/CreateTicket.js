const { SlashCommandBuilder } = require('@discordjs/builders');
const ticketConfig = require('../config/ticketConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-ticket')
        .setDescription('Create a new support ticket.'),
    async execute(interaction) {
        const category = interaction.guild.channels.cache.find(c => c.name === ticketConfig.ticketCategory && c.type === 4);

        if (!category) {
            return interaction.reply({ content: `Category ${ticketConfig.ticketCategory} does not exist. Please contact an admin.`, ephemeral: true });
        }

        const existingChannel = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
        if (existingChannel) {
            return interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });
        }

        const permissionOverwrites = [
            {
                id: interaction.guild.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: interaction.user.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            },
        ];

        ticketConfig.supportRoles.forEach(roleName => {
            const role = interaction.guild.roles.cache.find(r => r.name === roleName);
            if (role) {
                permissionOverwrites.push({
                    id: role.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                });
            } else {
                console.warn(`Role "${roleName}" not found in guild "${interaction.guild.name}".`);
            }
        });

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.id}`,
                type: 0, 
                parent: category.id,
                permissionOverwrites: permissionOverwrites,
            });

            await ticketChannel.send(`Hello ${interaction.user}, support will be with you shortly.`);

            const logChannel = interaction.guild.channels.cache.find(ch => ch.name === ticketConfig.logChannel);
            if (logChannel) {
                logChannel.send(`Ticket created: ${ticketChannel.name} by ${interaction.user.tag}`);
            }

            return interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
        } catch (error) {
            console.error(`Failed to create ticket channel: ${error.message}`);
            return interaction.reply({ content: `There was an error creating your ticket. Please contact an admin.`, ephemeral: true });
        }
    },
};
