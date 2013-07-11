var TeamApp = TeamApp || (function ($)
{

    var Utils   = {}, // Your Toolbox  
        Ajax    = {}, // Your Ajax Wrapper
        Events  = {}, // Event-based Actions      
        Routes  = {}, // Your Page Specific Logic
        App     = {}, // Your Global Logic and Initializer
        Public  = {}; // Your Public Functions

    var currentRoute = 0;

    Utils = {
        settings: {
            debug: true,
            meta: {},
            init: function ()
            {
                
                $('meta[name^="app-"]').each(function ()
                {
                    Utils.settings.meta[ this.name.replace('app-','') ] = this.content;
	            });
                
            }
        },
        cache: {
            window: window,
            document: document
        },
        home_url: function (path)
        {
            if(typeof path=="undefined"){
                path = '';
            }
            return Utils.settings.meta.homeURL+path+'/';            
        },
        log: function (what)
        {
            if (Utils.settings.debug) {
                console.log(what);
            }
        },
        parseRoute: function (input)
        {
	        
		    var delimiter = input.delimiter || '/',
		        paths = input.path.split(delimiter),
		        check = input.target[paths.shift()],
		        exists = typeof check != 'undefined',
		        isLast = paths.length == 0;
		    input.inits = input.inits || [];
		    
		    if (exists) {
                if(typeof check.init == 'function'){
                    input.inits.push(check.init);
                }
                if (isLast) {
		            input.parsed.call(undefined, {
		                exists: true,
		                type: typeof check,
		                obj: check,
		                inits: input.inits
		            });
		        } else {
		            Utils.parseRoute({
		                path: paths.join(delimiter), 
		                target: check,
		                delimiter: delimiter,
		                parsed: input.parsed,
		                inits: input.inits
		            });
		        }
		    } else {
		        input.parsed.call(undefined, {
		            exists: false
		        });
		    }
		},
		route: function ()
		{
            Utils.parseRoute({
	            path: Utils.settings.meta.route,
			    target: Routes,
			    delimiter: '/',
			    parsed: function (res)
			    {
                    if(res.exists && res.type=='function'){
                        if(res.inits.length!=0){
                            for(var i in res.inits){
			        			res.inits[i].call();
			        		}
			        	}
			        	res.obj.call();
			        }
			    }
	        });
        },
        shuffle : function (array) {
            var i, j, temp;
            for (i = array.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        },
        generate : function ()
        {
            var teams = [],
                flag = [],
                teamsLength = DYNAMIC.Storage.teamsNames.length,
                playersLength = parseInt(DYNAMIC.Storage.players.length / teamsLength),
                start = new Date().getTime(),
                i, j, rand, letGo;
            
            DYNAMIC.Storage.randomPlayers = Utils.shuffle(DYNAMIC.Storage.players);
            
            for (i = 0; i < teamsLength; i++) { // loop sur nombre de teams
                teams[DYNAMIC.Storage.teamsNames[i]] = []; // creer un tableau pour mettre joueur d'une team
                letGo = false;
                while(teams[DYNAMIC.Storage.teamsNames[i]].length < playersLength && !letGo){ // loop tant que player d'une team est inférieur au nombre souhaité
                    rand = parseInt(Math.random() * DYNAMIC.Storage.players.length); // choisie un joueur au hasard
                    if(flag.indexOf(rand) < 0){ // si le joueur au hasar a pas été flagé
                        if(typeof DYNAMIC.Storage.players[rand] === "undefined" || DYNAMIC.Storage.players[rand] === null) letGo = true;
                        else{
                            flag.push(rand); // push le flag
                            teams[DYNAMIC.Storage.teamsNames[i]].push(DYNAMIC.Storage.players[rand]); // push le joueur
                        }
                    }
                }
            };
            
            STATIC.pagesContent[3].duration = new Date().getTime() - start;
            STATIC.pagesContent[3].teams = [];
            STATIC.pagesContent[3].btn = "Generate teams again";
            for (var key in teams) {
                STATIC.pagesContent[3].teams.push({
                    teamName : key,
                    players : teams[key]
                });
            }
        }
    };
    var _log = Utils.log;
	
    Ajax = {
	    ajaxUrl: Utils.home_url('ajax'),
	    send: function (type, method, data, returnFunc, dataType)
	    {
	    	$.ajax({
	            type:'POST',
	            url: method,
	            dataType:dataType,
	            data: data,
	            success: returnFunc
	        });
	    },
	    call: function (method, data, returnFunc, dataType)
	    {
	        Ajax.send('POST', method, data, returnFunc, (dataType || 'json'));
	    },
	    get: function (method, data, returnFunc, dataType)
	    {
			Ajax.send('GET', method, data, returnFunc, (dataType || 'json'));
	    }
	};

    Events = {
        endpoints: {
            next : function ()
            {
                switch (currentRoute)
                {
                    case 0 : 
                        DYNAMIC.Storage.teams = parseInt($('.teams-number').val());
                        if(DYNAMIC.Storage.teams < 2 || isNaN(DYNAMIC.Storage.teams)) {
                            STATIC.pagesContent[1].count = DYNAMIC.Storage.teams = [{nb : 1, focus : ' autofocus="autofocus" '}, {nb : 1, focus : ''}];
                        }
                        else{
                            STATIC.pagesContent[1].count = [];
                            for (var i = 1; i <= DYNAMIC.Storage.teams; i++) {
                                if(i === 1) STATIC.pagesContent[1].count.push({nb : i, focus : ' autofocus="autofocus" '});
                                else STATIC.pagesContent[1].count.push({nb : i, focus : ''});
                            };
                        }
                    break;
                    case 1 : 
                        var inputs = $('input');
                        DYNAMIC.Storage.teamsNames = [];
                        $.each(inputs, function (i, o)
                        {
                            if($(o).val() !== "")
                            DYNAMIC.Storage.teamsNames.push($(o).val());
                        });
                    break;
                    case 2 :
                        Utils.generate();
                    break;
                    case 3 :
                        Utils.generate();
                    break;
                };
                
                if(currentRoute < 3) currentRoute++;
                Routes.nextRoute();
            },
            addPlayer : function ()
            {
                var newName = $('.new-player input').val();
                if(newName !== "" && DYNAMIC.Storage.players.indexOf(newName) < 0){
                    DYNAMIC.Storage.players.push(newName);
                    $('.add-wrapper').before(Mustache.to_html(STATIC.templates.playerInserted, { name : newName }));
                    $('.new-player input').val("");
                }
                else if(DYNAMIC.Storage.players.indexOf(newName) >= 0) {
                    var inputError = $('form .row:nth-child(' + (DYNAMIC.Storage.players.indexOf(newName) + 1) + ') input');
                    inputError.addClass('error');
                    var t = setTimeout(function ()
                    {
                        inputError.removeClass('error');
                        clearTimeout(t);
                    }, 500);
                }
                $('.new-player input').focus();
            }
        },
        bindEvents: function ()
        {
            
            $('[data-event]').each(function ()
            {
        		var _this = this,
        			method = _this.dataset.method || 'click',
        			name = _this.dataset.event,
        			bound = _this.dataset.bound;
        		
        		if(!bound){
	        		Utils.parseRoute({
			            path: name,
					    target: Events.endpoints,
					    delimiter: '.',
					    parsed: function(res) {
					    	if(res.exists){
					    		_this.dataset.bound = true;
					    		$(_this).on(method, function (e)
					    		{ 
					        		res.obj.call(_this, e);
					        	});
					       }
					    }
			        });
		        }
        	});
            
        },
        init: function ()
        {
            Events.bindEvents();
        }
    };
    Routes = {
        nextRoute : function ()
        {
            Ajax.call(STATIC.pages[currentRoute], {}, function (result)
            {
                $(STATIC.container.generator).html(Mustache.to_html(result, STATIC.pagesContent[currentRoute]));
                Events.bindEvents();
                App.progressBar.update();
            }, 'html');
        }
    };
    App = {
        progressBar: {
            update : function ()
            {
                $('.progress .meter').width(((currentRoute / (STATIC.pages.length - 1)) * 100) + "%");
            }
        },
        logic: {},
        init: function ()
        {
            $(document).foundation();
            Utils.settings.init();
            Events.init();
            //Events.endpoints.next();
            Utils.route();
        }
    };
    
    Public = {
        init: App.init  
    };

    return Public;

})(window.$);

Zepto(function($)
{
    TeamApp.init();
})

