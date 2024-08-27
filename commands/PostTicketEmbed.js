const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post-ticket-embed')
        .setDescription('Create a ticket creation embed message')
        .addStringOption(option => 
            option.setName('title')
                .setDescription('The title of the embed')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('description')
                .setDescription('The description of the embed')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('button-label')
                .setDescription('The label of the button')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('button-style')
                .setDescription('The style of the button')
                .setRequired(true)
                .addChoices(
                    { name: 'Primary', value: 'Primary' },
                    { name: 'Secondary', value: 'Secondary' },
                    { name: 'Success', value: 'Success' },
                    { name: 'Danger', value: 'Danger' }
                )
        ),
    async execute(interaction) {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const buttonLabel = interaction.options.getString('button-label');
        const buttonStyle = interaction.options.getString('button-style');

        const buttonStyleEnum = {
            'Primary': ButtonStyle.Primary,
            'Secondary': ButtonStyle.Secondary,
            'Success': ButtonStyle.Success,
            'Danger': ButtonStyle.Danger
        }[buttonStyle];

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('#5865F2');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel(buttonLabel)
                    .setStyle(buttonStyleEnum)
            );

        await interaction.channel.send({ embeds: [embed], components: [row] });

        return interaction.reply({ content: 'Ticket creation embed posted.', ephemeral: true });
    },
};
