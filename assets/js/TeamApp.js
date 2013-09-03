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
            document: document,
            popTemplate:null
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
        shuffle : function (arr)
        {
            var i, j, temp, array = arr.slice();
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
            
            for (i = 0; i < teamsLength; i++){
                teams[DYNAMIC.Storage.teamsNames[i]] = DYNAMIC.Storage.randomPlayers.splice(0, playersLength);
            }
            
            while(DYNAMIC.Storage.randomPlayers.length > 0){
                if(i == teamsLength) i = 0;
                teams[DYNAMIC.Storage.teamsNames[i]].push(DYNAMIC.Storage.randomPlayers.splice(0, 1));
            }
            
            STATIC.pagesContent[3].duration = new Date().getTime() - start;
            STATIC.pagesContent[3].teams = [];
            STATIC.pagesContent[3].btn = "Generate teams again";
            for (var key in teams) {
                STATIC.pagesContent[3].teams.push({
                    teamName : key,
                    players : teams[key]
                });
            }
        },
        error : function ($el)
        {
            $el.addClass('error');
            var t = setTimeout(function ()
            {
                $el.removeClass('error');
                clearTimeout(t);
            }, 500);
        },
        pop : function (content)
        {
            var $popContainer = $('<div class="pop"></div>');
            function on ()
            {
                $('body').append($popContainer);
                $popContainer.html(Mustache.to_html(Utils.cache.popTemplate, content));
                Events.bindEvents();
                var t = setTimeout(function ()
                {
                    $popContainer.addClass('on');
                    clearTimeout(t);
                }, 0);
            }
            if(Utils.cache.popTemplate === null)
                Ajax.call(STATIC.url.templates + "pop.html", {}, function (result)
                {
                    Utils.cache.popTemplate = result;
                    on();
                }, 'html');
            else on();
        },
        popRemove : function ()
        {
            var $pop = $('.pop');
            if($pop.size() > 0){
                $pop.removeClass('on').addClass('off');
                var t = setTimeout(function ()
                {
                    $pop.remove();
                    clearTimeout(t);
                }, 500);
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
                            STATIC.pagesContent[1].count = DYNAMIC.Storage.teams = [
                            	{
	                            	nb : 1,
	                        		focus : ' autofocus="autofocus" '
                        		},
                        		{
                        			nb : 1,
                        			focus : ''
                            	}
                            ];
                        }
                        else{
                            STATIC.pagesContent[1].count = [];
                            for (var i = 1; i <= DYNAMIC.Storage.teams; i++) {
                                if(i === 1)
                                	STATIC.pagesContent[1].count.push({
                                		nb : i,
                                		focus : ' autofocus="autofocus" '
                                	});
                                else
                                	STATIC.pagesContent[1].count.push({nb : i, focus : ''});
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
            restart : function ()
            {
                currentRoute = 0;
                Routes.nextRoute();
            },
            addPlayer : function ()
            {
                var newName = $('.new-player input').val();
                if(newName !== "" && DYNAMIC.Storage.players.indexOf(newName) < 0){
                    DYNAMIC.Storage.players.push(newName);
                    $('.add-wrapper').before(
                    	Mustache.to_html(
	                    	STATIC.templates.playerInserted,
	                    	{
	                    		name : newName,
	                    		index : (DYNAMIC.Storage.players.length - 1)
	                    	}
                    	)
                    );
                    $('.new-player input').val("");
                }
                else if(DYNAMIC.Storage.players.indexOf(newName) >= 0) {
                    Utils.error(
                    	$('form .row:nth-child(' + (DYNAMIC.Storage.players.indexOf(newName) + 1) + ') input')
                    );
                }
                $('.new-player input').focus();
                $('.delete-player') // reset event delete player
                .off('click')
                .on('click', function (e)
                {
                	var $toDelete = $(this).parents('.player-name-added');
                	DYNAMIC.Storage.players.splice(parseInt($toDelete.attr('data-index')), 1);
                	$toDelete.remove();
                });
            },
            teamName : function ()
            {
                notNullInputs = true;
                $.each($('input[type=text]'), function(i, o)
                {
                    if($(o).val() == "") {
                        Utils.error($(o));
                        notNullInputs = false;
                    }
                });
                if(notNullInputs) Events.endpoints.next();
            },
            pop : {
                load : function (page)
                {
                    Ajax.call(STATIC.url.templates + page + ".html", {}, function (result)
                    {
                        Utils.pop({content : result});
                    }, 'html');
                },
                back : function ()
                {
                    Utils.popRemove();
                },
                help : function ()
                {
                    Events.endpoints.pop.load('help');
                },
                credits : function ()
                {
                    Events.endpoints.pop.load('credits');
                }
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

