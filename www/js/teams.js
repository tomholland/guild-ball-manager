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

Warband.prototype.numPlayers = function() {
	return this.players.length;
}

Team.prototype.mustacheData = function() {
	var mustacheData = {
		'guild': staticData.guilds[this.guild].name,
		'players': []
	};
	for (var playerID in this.players) {
		var player = {
			'name': staticData.guilds[this.guild].players[this.players].name
		};
		if (staticData.guilds[this.guild].players[this.players].hasOwnProperty('captain')) {
			player.captain = true;
		}
		if (staticData.guilds[this.guild].players[this.players].hasOwnProperty('mascot')) {
			player.mascot = true;
		}
		mustacheData.players.push(player);
	}
	if (settingIsEnabled('lexicographicalsort')) {
		mustacheData.players.sort(sortObjectArrayByObjectNameProperty);
	}
	return mustacheData;
}

Team.prototype.addPlayer = function(playerID) {
	this.players.push(playerID);
}

Team.prototype.getPlayerName = function(playerID) {
	return staticData.guilds[this.guild].players[playerID].name;
}

Team.prototype.removePlayer = function(playerID) {
	this.players.splice(this.players.indexOf(playerID), 1);
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