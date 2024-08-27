const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-role-to-everyone')
        .setDescription('Adds a specified role to every member in the server.')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('The role to add to everyone')
                .setRequired(true)),
    
    async execute(interaction) {
        const role = interaction.options.getRole('role');

        await interaction.deferReply({ ephemeral: true });

        const members = await interaction.guild.members.fetch();
        let addedCount = 0;
        let errorCount = 0;

        for (const member of members.values()) {
            if (member.user.bot) continue;

            try {
                await member.roles.add(role);
                addedCount++;
            } catch (error) {
                console.error(`Failed to add role to ${member.user.tag}: ${error.message}`);
                errorCount++;
            }
        }

        return interaction.followUp({
            content: `Role "${role.name}" has been added to ${addedCount} members. ${errorCount} errors occurred.`,
            ephemeral: true
        });
    }
};
