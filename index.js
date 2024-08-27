require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Load role permissions from config
const permissions = require('./config/permissions');

// Load commands
client.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Register slash commands
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const commandData = Array.from(client.commands.values()).map(command => command.data.toJSON());

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.CORE_GUILD_ID),
            { body: commandData }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.log(`Error refreshing commands: ${error}`);
    }
})();

// Load event logging
require('./logs/logEvents')(client);

// Interactions
const interactionHandlers = {
    command: require('./interactions/handleCommand'),
    button: require('./interactions/handleButton'),
};

client.on('interactionCreate', async interaction => {
    try {
        let interactionType = null;

        if (interaction.isCommand()) interactionType = 'command';
        else if (interaction.isButton()) interactionType = 'button';

        if (interactionType && interactionHandlers[interactionType]) {
            await interactionHandlers[interactionType](interaction, client);
        } else {
            console.log(`No handler found for interaction type: ${interactionType}`);
        }
    } catch (error) {
        console.log(`Error executing interaction: ${error}`);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error executing this interaction!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error executing this interaction!', ephemeral: true });
        }
    }
});

// Login to Discord
client.login(process.env.TOKEN);
