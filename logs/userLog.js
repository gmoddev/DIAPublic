module.exports = {
    logJoin(member) {
        const channel = member.guild.channels.cache.find(ch => ch.name === 'join-leave-logs');
        if (!channel) return;
        channel.send(`User ${member.user.tag} (${member.id}) has joined the server.`);
    },

    logLeave(member) {
        const channel = member.guild.channels.cache.find(ch => ch.name === 'join-leave-logs');
        if (!channel) return;
        channel.send(`User ${member.user.tag} (${member.id}) has left the server.`);
    },

    logBan(ban) {
        const channel = ban.guild.channels.cache.find(ch => ch.name === 'ban-logs');
        if (!channel) return;
        channel.send(`User ${ban.user.tag} (${ban.user.id}) has been banned.`);
    },

    logUnban(ban) {
        const channel = ban.guild.channels.cache.find(ch => ch.name === 'ban-logs');
        if (!channel) return;
        channel.send(`User ${ban.user.tag} (${ban.user.id}) has been unbanned.`);
    },

    logKick(member) {
        const channel = member.guild.channels.cache.find(ch => ch.name === 'kick-logs');
        if (!channel) return;
        channel.send(`User ${member.user.tag} (${member.id}) has been kicked.`);
    },

    logWarning(guild, issuer, user, reason) {
        const channel = guild.channels.cache.find(ch => ch.name === 'warnings-log');
        if (!channel) return;
        channel.send(`${issuer} has warned ${user.tag} (${user.id}).\nReason: ${reason}`);
    },
};
