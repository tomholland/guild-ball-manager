var teams = {};
var teamsLawnchair;

function loadTeams(callback) {
	teamsLawnchair = new Lawnchair({adapter:'dom', name:'teams'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				var team = new Team();
				for (var prop in record.data) {
					team[prop] = record.data[prop];
				}
				teams[team.id] = team;
			});
		});
	});
	callback();
}

function Team() {
	this.id = null;
	this.name = null;
	this.guild = null;
	this.playerLimit = null;
	this.players = {};
	this.lastModified = null;
}

Team.prototype.mustacheData = function() {
	var mustacheData = {
		'guild': staticData.guilds[this.guild].name,
		'players': []
	};
	for (var teamPlayerID in this.players) {
		var teamPlayer = {
			'name': staticData.guilds[this.guild].players[this.players[teamPlayerID].guildPlayerID].name
		};
		if (staticData.guilds[this.guild].players[this.players[teamPlayerID].guildPlayerID].hasOwnProperty('captain')) {
			teamPlayer.captain = true;
		}
		if (staticData.guilds[this.guild].players[this.players[teamPlayerID].guildPlayerID].hasOwnProperty('mascot')) {
			teamPlayer.mascot = true;
		}
		mustacheData.players.push({'name': staticData.guilds[this.guild].players[this.players[teamPlayerID].guildPlayerID].name});
	}
	if (settingIsEnabled('lexicographicalsort')) {
		mustacheData.players.sort(sortObjectArrayByObjectNameProperty);
	}
	return mustacheData;
}

Team.prototype.addPlayer = function(guildPlayerID) {
	this.players[generateUUID()] = {'guildPlayerID': guildPlayerID};
}

Team.prototype.getPlayerID = function(teamPlayerID) {
	return this.players[teamPlayerID].guildPlayerID;
}

Team.prototype.getPlayerName = function(teamPlayerID) {
	return staticData.guilds[this.guild].players[this.players[teamPlayerID].guildPlayerID].name;
}

Team.prototype.removePlayer = function(teamPlayerID) {
	delete this.players[teamPlayerID];
}

Team.prototype.save = function(callback) {
	this.lastModified = new Date().toISOString();
	var dataObj = {};
	for (var prop in this) {
		dataObj[prop] = this[prop];
	}
	teamsLawnchair.save(
		{key: this.id, data: dataObj},
		function(record) {
			callback();
		}
	);
}

Team.prototype.delete = function(callback) {
	if (this.id === null) return;
	teamsLawnchair.remove(this.id, function() {
		callback();
	});
}