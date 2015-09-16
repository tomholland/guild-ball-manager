var staticData = null;
var contentViewWidth = 0;
var currentTemplateId = null;
var selectedGuildId = null;
var selectedTeamId = null;

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function generateUuid() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c==='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid.toUpperCase();
}

function sortObjectArrayByNameProperty(objA, objB) {
	return alphanumCase(objA.name, objB.name);
}

function cloneProperties(sourceObj, targetObj) {
	for (var prop in sourceObj) {
		if (sourceObj.hasOwnProperty(prop)) {
			targetObj[prop] = sourceObj[prop];
		}
	}
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
			templateData.guild_class = staticData.guilds[contentId].name.toLowerCase();
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
			loadTeams(function() {
				$('#title').html('Teams');
				var teamsSortArray = [];
				Object.keys(teams).forEach(function(teamId) {
					teamsSortArray.push({
						id: teamId,
						name: teams[teamId].name
					});
				});
				loadSettings(function() {
					if (settingIsEnabled('lexicographicalsort')) {
						teamsSortArray.sort(sortObjectArrayByNameProperty);
					}
					templateData.teams = [];
					teamsSortArray.forEach(function(team) {
						templateData.teams.push({
							id: team.id,
							image: staticData.guilds[teams[team.id].guildId].image,
							name: team.name,
							complete: teams[team.id].isComplete(),
							num_players: teams[team.id].playerIds().length,
							player_limit: teams[team.id].playerLimit
						});
					});
					$('#back').removeClass('shown');
					$('#add').addClass('shown');
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'team':
			$('#title').html(((selectedTeamId === null) ? 'Create':'Edit')+' team');
			templateData.edit = (selectedTeamId !== null);
			templateData.guilds = [];
			Object.keys(staticData.guilds).forEach(function(guildId) {
				templateData.guilds.push({
					id: guildId,
					name: staticData.guilds[guildId].name,
					selected: (selectedTeamId !== null && teams[selectedTeamId].guildId == guildId)
				});
			});
			templateData.name = ((selectedTeamId !== null) ? teams[selectedTeamId].name:'');
			templateData.size = ((selectedTeamId !== null) ? teams[selectedTeamId].playerLimit:'');
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'team_players':
			loadTeams(function() {
				$('#title').html(htmlEncode(teams[selectedTeamId].name));
				templateData.guild_class = staticData.guilds[teams[selectedTeamId].guildId].name.toLowerCase();
				templateData.players = [];
				Object.keys(teams[selectedTeamId].players).forEach(function(teamPlayerId) {
					var player = {
						guild_id: teams[selectedTeamId].players[teamPlayerId].guildId,
						guild_image: staticData.guilds[teams[selectedTeamId].players[teamPlayerId].guildId].image,
						team_player_id: teamPlayerId
					};
					cloneProperties(
						staticData.guilds[teams[selectedTeamId].players[teamPlayerId].guildId].players[teams[selectedTeamId].players[teamPlayerId].playerId],
						player
					);
					templateData.players.push(player);
				});
				loadSettings(function() {
					if (settingIsEnabled('lexicographicalsort')) {
						templateData.players.sort(sortObjectArrayByNameProperty);
					}
					$('#back').addClass('shown');
					$('#add').addClass('shown');
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'team_add_player':
			loadTeams(function() {
				$('#title').html('Add player to team');
				$('#back').addClass('shown');
				$('#add').removeClass('shown');
				renderTemplate(templateId, templateData);
			});
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
	renderTemplate(templateId, templateData);
}

function renderTemplate(templateId, templateData) {
	$('.content').empty().html(Mustache.render(staticData.templates[templateId], templateData));
	setContentScrollViewWrapperDimensions();
	currentTemplateId = templateId;
	addEventsToRenderedView();
}

function setContentScrollViewWrapperDimensions() {
	$('.content-view .content-view-scroll-wrapper').css({width: contentViewWidth+'px', height: $('.content').height()+'px'});
}

function setupSwipeableListing(parentalElement) {
	var actionBlockWidth = 50;
	parentalElement.find('.swipe-wrapper').swipeLeft(function() {
		$(this).addClass('offset');
	}).swipeRight(function() {
		$(this).removeClass('offset');
	});
	parentalElement.find('.action-1').css('margin-left', contentViewWidth+'px');
	parentalElement.find('.action-2').css('margin-left', (contentViewWidth + actionBlockWidth)+'px');
	parentalElement.find('.action-3').css('margin-left', (contentViewWidth + (actionBlockWidth * 2))+'px');
}

function populatePlayerSuggestions(search) {
	var existingPlayerIdsInTeam = teams[selectedTeamId].playerIds();
	var templateData = {
		players: []
	};
	Object.keys(staticData.guilds[teams[selectedTeamId].guildId].players).forEach(function(playerId) {
		if (existingPlayerIdsInTeam.indexOf(staticData.guilds[teams[selectedTeamId].guildId].players[playerId].id) < 0
			&& (search.length === 0 || (staticData.guilds[teams[selectedTeamId].guildId].players[playerId].name.toLowerCase()).indexOf(search.toLowerCase()) >= 0)) {
			var player = {
				guild_class: staticData.guilds[teams[selectedTeamId].guildId].name.toLowerCase(),
				guild_id: teams[selectedTeamId].guildId,
				guild_image: staticData.guilds[teams[selectedTeamId].guildId].image
			};
			cloneProperties(staticData.guilds[teams[selectedTeamId].guildId].players[playerId], player);
			templateData.players.push(player);
		}
	});
	Object.keys(staticData.guilds).forEach(function(guildId) {
		if (guildId !== teams[selectedTeamId].guildId
			&& staticData.guilds[guildId].hasOwnProperty('has_shareable_players')) {
			Object.keys(staticData.guilds[guildId].players).forEach(function(playerId) {
				if (staticData.guilds[guildId].players[playerId].hasOwnProperty('also_available_to')
					&& staticData.guilds[guildId].players[playerId].also_available_to.indexOf(teams[selectedTeamId].guildId) >= 0
					&& existingPlayerIdsInTeam.indexOf(staticData.guilds[guildId].players[playerId].id) < 0
					&& (search.length === 0 || (staticData.guilds[guildId].players[playerId].name.toLowerCase()).indexOf(search.toLowerCase()) >= 0)) {
					var player = {
						guild_class: staticData.guilds[guildId].name.toLowerCase(),
						guild_id: guildId,
						guild_image: staticData.guilds[guildId].image
					};
					cloneProperties(staticData.guilds[guildId].players[playerId], player);
					templateData.players.push(player);
				}
			});
		}
	});
	$('.content-items-list').empty().html(Mustache.render(staticData.templates.player_suggestions, templateData));
	setContentScrollViewWrapperDimensions();
	$('.content-items-list').find('.listing-block').tap(function() {
		$('#teamplayersearch').blur();
		teams[selectedTeamId].addPlayer($(this).attr('data-guild-id'), $(this).attr('data-player-id'));
		teams[selectedTeamId].save(function() {
			renderView('team_players', null);
		});
	});
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
		case 'teams':
			setupSwipeableListing($('.content-items-list'));
			$('.content-items-list').find('.action-block').tap(function() {
				if ($(this).hasClass('share')) {
					var teamId = $(this).attr('data-team-id');
					var params = {
						'subject': 'Guild Ball team: '+teams[teamId].name,
						'onSuccess': function() {
							$('.content-items-list').find('.swipe-wrapper.offset').removeClass('offset');
						},
						'onError': function() {
							$('.content-items-list').find('.swipe-wrapper.offset').removeClass('offset');
						}
					};
					var emailTemplateData = {
						guild_name: staticData.guilds[teams[teamId].guildId].name,
						team_name: teams[teamId].name,
						players: []
					};
					Object.keys(teams[teamId].players).forEach(function(teamPlayerId) {
						emailTemplateData.players.push(staticData.guilds[teams[teamId].players[teamPlayerId].guildId].players[teams[teamId].players[teamPlayerId].playerId]);
					});
					loadSettings(function() {
						if (settingIsEnabled('lexicographicalsort')) {
							emailTemplateData.players.sort(sortObjectArrayByNameProperty);
						}
						if (settingIsEnabled('htmlemailsetting')) {
							params.body = Mustache.render(staticData.templates.team_email_html, emailTemplateData);
							params.isHtml = true;
						} else {
							params.body = Mustache.render(staticData.templates.team_email_txt, emailTemplateData);
						}
						cordova.require('emailcomposer.EmailComposer').show(params);
					});					
				} else if ($(this).hasClass('edit')) {
					selectedTeamId = $(this).attr('data-team-id');
					renderView('team', null);
				} else if ($(this).hasClass('delete')) {
					var teamId = $(this).attr('data-team-id');
					navigator.notification.confirm(
						'Are you sure you want to delete the team '+teams[teamId].name+'?',
						function(button) {
							if (button !== 2) {
								return;
							}
							teams[teamId].delete(function() {
								delete teams[teamId];
								renderView('teams', null);
							});
						},
						'Delete team',
						['Cancel','Delete']
					);
				}
			});
			$('.content-items-list').find('.listing-block').tap(function() {
				selectedTeamId = $(this).attr('data-team-id');
				renderView('team_players', null);
			});
		break;
		case 'team':
			$('.content-view').find('form').on('submit', function(e) {
				e.preventDefault();
			});
			$('#saveteam').tap(function() {
				var teamGuildId = $('#teamguild').val();
				var teamName = $('#teamname').val().trim();
				var teamPlayerLimit = $('#teamsize').val().trim();
				if (selectedTeamId === null
					&& Object.keys(staticData.guilds).indexOf(teamGuildId) < 0) {
					navigator.notification.alert(
						'Please select a guild',
						function() {
							$('#teamguild').focus();
						}
					);
					return;
				}
				if (!teamName.length) {
					navigator.notification.alert(
						'Please enter a team name',
						function() {
							$('#teamname').focus();
						}
					);
					return;
				}
				if (teamName.length > 28) {
					navigator.notification.alert(
						'Team names are limited to 28 characters',
						function() {
							$('#teamname').focus();
						}
					);
					return;
				}
				if (!teamPlayerLimit.match(/^[0-9]{1,2}$/)) {
					navigator.notification.alert(
						'Please enter a player limit between 3 and 10',
						function() {
							$('#teamsize').focus();
						}
					);
					return;
				}
				teamPlayerLimit = parseInt(teamPlayerLimit, 10);
				if (teamPlayerLimit < 3
					|| teamPlayerLimit > 10) {
					navigator.notification.alert(
						'Please enter a player limit between 3 and 10',
						function() {
							$('#teamsize').focus();
						}
					);
					return;
				}
				$('input,select').blur();
				if (selectedTeamId === null) {
					var newTeamId = generateUuid();
					teams[newTeamId] = new Team();
					teams[newTeamId].id = newTeamId;
					teams[newTeamId].guildId = teamGuildId;
					teams[newTeamId].name = teamName;
					teams[newTeamId].playerLimit = teamPlayerLimit;
				} else {
					teams[selectedTeamId].guildId = teamGuildId;
					teams[selectedTeamId].name = teamName;
					teams[selectedTeamId].playerLimit = teamPlayerLimit;
				}
				teams[((selectedTeamId === null) ? newTeamId:selectedTeamId)].save(function() {
					renderView('teams', null);
				});
			});
		break;
		case 'team_players':
			setupSwipeableListing($('.content-items-list'));
			$('.content-items-list').find('.action-block.delete').tap(function() {
				var teamPlayerId = $(this).attr('data-team-player-id');
				navigator.notification.confirm(
					'Are you sure you want to delete '+teams[selectedTeamId].getPlayerName(teamPlayerId)+' from your team "'+teams[selectedTeamId].name+'"?',
					function(button) {
						if (button !== 2) {
							return;
						}
						teams[selectedTeamId].removePlayer(teamPlayerId);
						teams[selectedTeamId].save(function() {
							renderView('team_players', null);
						});
					},
					'Delete team player',
					['Cancel','Delete']
				);
			});
			$('.content-items-list').find('.listing-block').tap(function() {
				selectedGuildId = $(this).attr('data-guild-id');
				renderView('player_cards', $(this).attr('data-player-id'));
			});
		break;
		case 'team_add_player':
			populatePlayerSuggestions('');
			$('#teamplayersearch').keyup(function() {
				populatePlayerSuggestions($(this).val());
			});
			$('.content-view').find('form').on('submit', function(e) {
				e.preventDefault();
			});
		break;
		case 'plots':
			$('.content-items-list').find('a').tap(function() {
				renderView('plot_card', $(this).attr('data-plot-id'));
			});
		break;
		case 'guides':
			$('.content-items-list').find('a').tap(function() {
				cordova.plugins.disusered.open(decodeURIComponent(cordova.file.applicationDirectory)+'www/'+$(this).attr('data-url'));
			});
		break;
		case 'misc':
			$('.content-items-list').find('a').tap(function() {
				renderView($(this).attr('data-template-id'), null);
			});
		break;
		case 'settings':
			loadSettings(function() {
				$('.content-items-list').find('.toggle').each(function() {
					if (settingIsEnabled($(this).attr('data-setting-id'), $(this).attr('data-default'))) {
						$(this).addClass('active');
					}
				});
				$('.content-items-list').find('.toggle').on('toggle', function(toggleEvent) {
					settings[$(this).attr('data-setting-id')].save(toggleEvent.detail.isActive, null);
				});
			});			
		break;
		case 'faqs':
			$('.content-items-list').find('a').tap(function() {
				renderView('faq', $(this).attr('data-faq-id'));
			});
		break;
		case 'faq':
			$('.content-view').find('a.external').tap(function() {
				window.open(encodeURI($(this).attr('data-url')), '_system');
			});
			$('.content-view').find('a.email').tap(function() {
				cordova.require('emailcomposer.EmailComposer').show({
					to: $(this).attr('data-email'),
					subject: $(this).attr('data-subject')
				});
			});
			$('.content-view').find('a.twitter').tap(function() {
				var username = $(this).attr('data-username');
				appAvailability.check(
					'tweetbot://',
					function() { // success
						window.open(encodeURI('tweetbot:///user_profile/'+username), '_system');
					},
					function() { // fail
						appAvailability.check(
							'twitterrific://',
							function() { // success
								window.open(encodeURI('twitterrific:///profile?screen_name='+username), '_system');
							},
							function() { // fail
								appAvailability.check(
									'twitter://',
									function() { // success
										window.open(encodeURI('twitter://user?screen_name='+username), '_system');
									},
									function() { // fail
										window.open(encodeURI('https://twitter.com/'+username), '_system');
									}
								);
							}
						);
					}
				);
			});
		break;
	}
}

document.addEventListener('deviceready', function() {
	Keyboard.automaticScrollToTopOnHiding = true;
	Keyboard.shrinkView(false);
	Keyboard.disableScrollingInShrinkView(true);
	
	contentViewWidth = $('.content').width();
	
	$('#back').tap(function() {
		$('input,select').blur();
		switch(currentTemplateId) {
			case 'guild_players':
				renderView('guilds', null);
			break;
			case 'player_cards':
				if ($('nav').find('a.active').attr('data-template-id') === 'teams') {
					renderView('team_players', null);
				} else {
					renderView('guild_players', selectedGuildId);
				}
			break;
			case 'team':
			case 'team_players':
				renderView('teams', null);
			break;
			case 'team_add_player':
				renderView('team_players', null);
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
	
	$('#add').tap(function() {
		switch(currentTemplateId) {
			case 'teams':
				selectedTeamId = null;
				renderView('team', null);
			break;
			case 'team_players':
				renderView('team_add_player', null);
			break;
		}
	});
	
	$('nav').find('a').tap(function() {
		$('nav').find('a').removeClass('active');
		renderView($(this).attr('data-template-id'), null);
		$(this).addClass('active');
	});
	
	$.getJSON('js/static-data.json', function(json) {
		staticData = json;
		Object.keys(staticData.templates).forEach(function(templateId) {
			Mustache.parse(staticData.templates[templateId]);
		});
		$('nav').find('[data-template-id=guilds]').trigger('tap');
	});
	
}, false);