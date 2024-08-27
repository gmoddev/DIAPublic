module.exports = {
    logPromotionOrDemotion(promoter, promotee, action, details) {
        const channel = promotee.guild.channels.cache.find(ch => ch.name === 'promotion-logs');
        if (!channel) return;
        
        channel.send(`${promoter} has ${action.toLowerCase()} ${promotee.user.tag} (${promotee.id}).\nDetails: ${details}.\nPromoter ID: ${promoter.id}\nPromotee ID: ${promotee.id}`);
    },
};
