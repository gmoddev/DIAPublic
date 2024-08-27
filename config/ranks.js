module.exports = {
    ROLES: {
        ADMIN: '1273128080306606123',
        LEADERSHIP: '1273138999594188800',
        GENERAL: '1273139653947691019',
        LIEUTENANT_GENERAL: '1273140015303622696',
        CANDIDATE: '1273140218106613791',
        SECRET_SERVICE: '1273727572596756571',
        POLICE_FORCE: '1273727675940339784',
        REPRESENTATIVE: '1274808639735205939',
        ALL_MEMBERS: '1274936058806534225',
        MILITARY: '1274936355918708738',
        DIRECTOR: '1274936394330144768',
        CHIEF_OF_POLICE: '1274936499510575176',
        BRIGADER_GENERAL: '1274936533664661615',
        GENERAL_PERSONNEL: '1274936599859167273',
        LIEUTENANT: '1274936729304043634',
        SERGEANT: '1274936786832982127',
        OFFICER: '1274936920752787479',
        AGENT: '1274937041175449601',
        PRIVATE: '1274938723523493950',
        CORPORAL: '1274938856080408607',
        ASSISTANT: '1274939547460960300',
        AWAITING_VETTING: '1275931901479358565',
    },

    ADMIN_HIERARCHY: [
        'ADMIN',
        'LEADERSHIP',
        'ASSISTANT',
    ],
    
    DIV_LEADERS: {
        'BRIGADER_GENERAL': "Military",
        'DIRECTOR': "Secret Service",
        'CHIEF_OF_POLICE': "Police Force"
    },

    MILITARY_RANKS: [
        'LIEUTENANT',
        'SERGEANT',
        'CORPORAL',
        'PRIVATE'
    ],
    SS_RANKS: [
        'AGENT'
    ],
    POLICE_RANKS: [
        'SERGEANT',
        'CORPORAL',
        'OFFICER'
    ],

    DIVISIONS: {
        'Secret Service': '1273727572596756571',
        'Police Force': '1273727675940339784',
        'Military': '1274936355918708738',
        'No Division': '1275931859548766389', 
    },
};
