var contentViewWidth = 0;
var currentTemplateId = null;
var selectedGuildId = null;

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function generateUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c==='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid.toUpperCase();
}

function renderView(templateId, contentId) {
	var templateData = {};
	switch(templateId) {
		case 'guilds':
			$('#title').html('Guilds');
			templateData.guilds = [];
			Object.keys(staticData.guilds).forEach(function(guildId) {
				templateData.guilds.push(staticData.guilds[guildId]);
			});
			$('#back').removeClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'guild_players':
			selectedGuildId = contentId;
			$('#title').html(htmlEncode(staticData.guilds[contentId].name));
			templateData.players = [];
			Object.keys(staticData.guilds[contentId].players).forEach(function(playerId) {
				templateData.players.push(staticData.guilds[contentId].players[playerId]);
			});
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'player_cards':
			$('#title').html(htmlEncode(staticData.guilds[selectedGuildId].players[contentId].name));
			templateData = staticData.guilds[selectedGuildId].players[contentId];
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'teams':
			$('#title').html('Teams');
			
			$('#back').removeClass('shown');
			$('#add').addClass('shown');
		break;
		case 'create_team':
			$('#title').html('Create team');
			
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'team':
			$('#title').html();
			
			$('#back').addClass('shown');
			$('#add').addClass('shown');
		break;
		case 'add_player':
			$('#title').html('Add player to team');
			/*
			Object.keys(staticData.guilds).forEach(function(guildId) {
				staticData.guilds[guildId].name
				staticData.guilds[guildId].image
				staticData.guilds[guildId].has_shareable_players?
				Object.keys(staticData.guilds[guildId].players).forEach(function(playerId) {
					staticData.guilds[guildId].players[playerId].name
					staticData.guilds[guildId].players[playerId].captain?
					staticData.guilds[guildId].players[playerId].mascot?
					staticData.guilds[guildId].players[playerId].also_available_to? // union
					staticData.guilds[guildId].players[playerId].cards
				});
			});
			*/
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'plots':
			$('#title').html('Plots');
			templateData.plots = [];
			Object.keys(staticData.plots).forEach(function(plotId) {
				templateData.plots.push(staticData.plots[plotId]);
			});
			$('#back').removeClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'plot_card':
			$('#title').html(htmlEncode(staticData.plots[contentId].name));
			templateData = staticData.plots[contentId];
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'guides':
			$('#title').html('Guides');
			templateData.guides = [];
			Object.keys(staticData.guides).forEach(function(guideId) {
				templateData.guides.push(staticData.guides[guideId]);
			});
			$('#back').removeClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'misc':
			$('#title').html('Misc.');
			$('#back').removeClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'settings':
			$('#title').html('Settings');
			templateData.settings = [];
			Object.keys(staticData.settings).forEach(function(settingId) {
				templateData.settings.push(staticData.settings[settingId]);
			});
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'faqs':
			$('#title').html('FAQs');
			templateData.faqs = [];
			Object.keys(staticData.faqs).forEach(function(faqId) {
				templateData.faqs.push(staticData.faqs[faqId]);
			});
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'faq':
			$('#title').html(htmlEncode(staticData.faqs[contentId].title));
			templateData = staticData.faqs[contentId];
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
	}
	$('.content').empty().html(Mustache.render(staticData.templates[templateId], templateData));
	$('.content-view .content-view-scroll-wrapper').css({width: contentViewWidth+'px', height: $('.content').height()+'px'});
	currentTemplateId = templateId;
	addEventsToRenderedView();
}

function addEventsToRenderedView() {
	switch(currentTemplateId) {
		case 'guilds':
			$('.content-items-list').find('a').tap(function() {
				renderView('guild_players', $(this).attr('data-guild-id'));
			});
		break;
		case 'guild_players':
			$('.content-items-list').find('a').tap(function() {
				renderView('player_cards', $(this).attr('data-player-id'));
			});
		break;
		case 'player_cards':
			
		break;
		case 'teams':
			
		break;
		case 'create_team':
			
		break;
		case 'team':
			
		break;
		case 'add_player':
			
		break;
		case 'plots':
			$('.content-items-list').find('a').tap(function() {
				renderView('plot_card', $(this).attr('data-plot-id'));
			});
		break;
		case 'plot_card':
			
		break;
		case 'guides':
			$('.content-items-list').find('a').tap(function() {
				cordova.plugins.disusered.open(cordova.file.applicationDirectory+'www/'+$(this).attr('data-url'));
			});
		break;
		case 'misc':
			$('.content-items-list').find('a').tap(function() {
				renderView($(this).attr('data-template-id'), null);
			});
		break;
		case 'settings':
			$('.content-items-list').find('a').tap(function() {
				
			});
		break;
		case 'faqs':
			$('.content-items-list').find('a').tap(function() {
				renderView('faq', $(this).attr('data-faq-id'));
			});
		break;
		case 'faq':
			
		break;
	}
	
	$('.content').find('a').on('click', function() {
		$(this).trigger('tap');
	});
}

document.addEventListener('deviceready', function() {
	/*
	Keyboard.automaticScrollToTopOnHiding = true;
	Keyboard.shrinkView(false);
	Keyboard.disableScrollingInShrinkView(true);
	*/
	
	Object.keys(staticData.templates).forEach(function(templateId) {
		Mustache.parse(staticData.templates[templateId]); // pre-parse for speed
	});
	
	contentViewWidth = $('.content').width();
	
	//$('#back').tap(function() {
	$('#back').on('click', function() {
		switch(currentTemplateId) {
			case 'guild_players':
				renderView('guilds', null);
			break;
			case 'player_cards':
				renderView('guild_players', selectedGuildId);
			break;
			case 'create_team':
			case 'team':
				renderView('teams', null);
				renderView('teams', null);
			break;
			case 'add_player':
				
			break;
			case 'plot_card':
				renderView('plots', null);
			break;
			case 'settings':
			case 'faqs':
				renderView('misc', null);
			break;
			case 'faq':
				renderView('faqs', null);
			break;
		}
	});
	
	//$('#add').tap(function() {
	$('#add').on('click', function() {
		switch(templateId) {
			case 'teams':
				
			break;
			case 'team':
				
			break;
		}
	});
	
	//$('nav').find('a').tap(function() {
	$('nav').find('a').on('click', function() {
		$('nav').find('a').removeClass('active');
		renderView($(this).attr('data-template-id'), null);
		$(this).addClass('active');
	});
	
	renderView('guilds', null);
	$('nav').find('[data-template-id=guilds]').addClass('active');
	
}, false);

$(document).trigger('deviceready');