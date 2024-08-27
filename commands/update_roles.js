const { SlashCommandBuilder } = require('@discordjs/builders');
const parser = require('../utils/parser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update-roles')
        .setDescription('Synchronize user roles in the secondary servers to match those in the core server.'),

    async execute(interaction) {
        const coreGuildID = process.env.CORE_GUILD_ID;
        const coreGuild = interaction.client.guilds.cache.get(coreGuildID);
        const secondaryGuildIDs = parser.parseGuildIDs('SECONDARY_GUILD_IDs');

        if (!coreGuild) {
            return interaction.reply({ content: 'Core server not found.', ephemeral: true });
        }

        await interaction.reply({ content: 'Attempting to update user roles in the secondary servers...', ephemeral: true });

        let success = true;
        let errors = [];

        for (const guildID of secondaryGuildIDs) {
            const secondaryGuild = interaction.client.guilds.cache.get(guildID);
            if (!secondaryGuild) continue;

            await interaction.followUp({ content: `Updating user roles in ${secondaryGuild.name}...`, ephemeral: true });

            const members = await secondaryGuild.members.fetch();

            for (const [memberID, member] of members) {
                const coreMember = await coreGuild.members.fetch(memberID).catch(() => null);
                if (!coreMember) continue;

                // filters out @everyone, i made the mistake of not doing that the first time
                const coreRoles = coreMember.roles.cache.filter(role => role.id !== coreGuild.id && !role.managed);
                const memberRolesInSecondary = member.roles.cache.filter(role => role.id !== secondaryGuild.id && !role.managed);

                const rolesToAdd = coreRoles.filter(role => !memberRolesInSecondary.some(r => r.name === role.name));
                const rolesToRemove = memberRolesInSecondary.filter(role => !coreRoles.some(r => r.name === role.name));

                try {
                    for (const role of rolesToAdd.values()) {
                        const secondaryRole = secondaryGuild.roles.cache.find(r => r.name === role.name);
                        if (secondaryRole) {
                            await member.roles.add(secondaryRole);
                            console.log(`Added role ${secondaryRole.name} to ${member.user.tag} in ${secondaryGuild.name}.`);
                        }
                    }

                    for (const role of rolesToRemove.values()) {
                        await member.roles.remove(role);
                        console.log(`Removed role ${role.name} from ${member.user.tag} in ${secondaryGuild.name}.`);
                    }

                } catch (error) {
                    console.error(`Failed to update roles for ${member.user.tag} in ${secondaryGuild.name}: ${error.message}`);
                    errors.push(`Failed to update roles for ${member.user.tag} in ${secondaryGuild.name}: ${error.message}`);
                    success = false;
                }
            }

            await interaction.followUp({ content: `Finished updating roles in ${secondaryGuild.name}.`, ephemeral: true });
        }

        if (success) {
            await interaction.followUp({ content: 'User roles have been successfully updated in all secondary servers.', ephemeral: true });
        } else {
            await interaction.followUp({ content: `Role updating completed with some errors:\n${errors.join('\n')}`, ephemeral: true });
        }
    }
};
