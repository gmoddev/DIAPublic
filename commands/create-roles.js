const { SlashCommandBuilder } = require('@discordjs/builders');
const parser = require('../utils/parser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-roles')
        .setDescription('Clone all roles from the core server to secondary servers.'),

    async execute(interaction) {
        const coreGuildID = process.env.CORE_GUILD_ID;
        const coreGuild = interaction.client.guilds.cache.get(coreGuildID);
        const secondaryGuildIDs = parser.parseGuildIDs('SECONDARY_GUILD_IDs');

        if (!coreGuild) {
            return interaction.reply({ content: 'Core server not found.', ephemeral: true });
        }

        // Send initial message
        const initialMessage = await interaction.reply({ content: 'Attempting to create roles in the secondary servers...', ephemeral: true, fetchReply: true });

        let success = true;
        let errors = [];

        for (const guildID of secondaryGuildIDs) {
            const secondaryGuild = interaction.client.guilds.cache.get(guildID);
            if (!secondaryGuild) continue;

            for (const role of coreGuild.roles.cache.values()) {
                try {
                    const existingRole = secondaryGuild.roles.cache.find(r => r.name === role.name);
                    if (existingRole) {
                        console.log(`Role ${role.name} already exists in ${secondaryGuild.name}, skipping.`);
                        continue;
                    }

                    await secondaryGuild.roles.create({
                        name: role.name,
                        color: role.color,
                        permissions: role.permissions,
                        hoist: role.hoist,
                        mentionable: role.mentionable,
                        reason: `Role cloned from ${coreGuild.name}`,
                    });

                    console.log(`Role ${role.name} created in ${secondaryGuild.name}.`);
                } catch (error) {
                    console.error(`Failed to create role ${role.name} in ${secondaryGuild.name}: ${error.message}`);
                    errors.push(`Failed to create role ${role.name} in ${secondaryGuild.name}: ${error.message}`);
                    success = false;
                }
            }
        }

        if (success) {
            await interaction.followUp({ content: 'Roles have been successfully cloned to the secondary servers.', ephemeral: true });
        } else {
            await interaction.followUp({ content: `Role cloning completed with some errors:\n${errors.join('\n')}`, ephemeral: true });
        }
    }
};
