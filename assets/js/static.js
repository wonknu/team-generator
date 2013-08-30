var STATIC = STATIC || {},
    DYNAMIC = DYNAMIC || {};

STATIC.url = {};

//STATIC.url.base = 'chrome-extension://khnjpdoglepnkkacfoplmppkbbokemgk/' // ADFAB
STATIC.url.base = 'chrome-extension://fclfncgebknppkdoinfjgegegfcjiphm/' // HOME
STATIC.url.templates = STATIC.url.base + 'templates/';

STATIC.pages = [
    STATIC.url.templates + "team-number.html",
    STATIC.url.templates + "team-name.html",
    STATIC.url.templates + "players-name.html",
    STATIC.url.templates + "teams-result.html"
];

STATIC.pagesContent = [
    {
        title : "How many teams?",
        btnNext : "Next »"
    },
    {
        title : "Team's name :",
        count : [{nb : 1, focus : ' autofocus="autofocus" '}, {nb : 1, focus : ''}],
        btnNext : "Next »"
    },
    {
        title : "Player's name :",
        btnAdd : "Add +",
        btnNext : "Next »"
    },
    {
        
    }
];

STATIC.container = {
    generator : '.generator'
};

STATIC.templates = {
    playerInserted : '<div class="row collapse player-name-added" data-index="{{index}}">' +
                        '<div class="small-11 columns">' +
                            '<input type="text" placeholder="player name" value="{{name}}" disabled>' +
                        '</div>' +
                        '<div class="small-1 columns">' +
                            '<a href="#" class="button magenta prefix delete-player">X</a>' +
                        '</div>' +
                    '</div>'
};

STATIC.lastGenerationDuration = 0;

DYNAMIC.Storage  = {
    teams : 0,
    teamsNames : [],
    players : [],
    randomPlayers : []
};
