var teams = null;
var teamsLawnchair;

function loadTeams(callback) {
	if (teams !== null) {
		callback();
		return;
	}
	teams = {};
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
		callback();
	});
}

function Team() {
	this.id = null;
	this.name = null;
	this.guildId = null;
	this.playerLimit = null;
	this.players = {};
	this.lastModified = null;
}

Team.prototype.addPlayer = function(guildId, playerId) {
	this.players[generateUuid()] = {
		guildId: guildId,
		playerId: playerId
	};
}

Team.prototype.getPlayerName = function(teamPlayerId) {
	return staticData.guilds[this.players[teamPlayerId].guildId].players[this.players[teamPlayerId].playerId].name;
}

Team.prototype.removePlayer = function(teamPlayerId) {
	delete this.players[teamPlayerId];
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

Team.prototype.playerIds = function() {
	var playerIds = [];
	Object.keys(this.players).forEach(function(teamPlayerId) {
		playerIds.push(this.players[teamPlayerId].playerId);
	}, this);
	return playerIds;
}

Team.prototype.isComplete = function() {
	var countCaptainsFound = 0;
	var countMascotsFound = 0;
	Object.keys(this.players).forEach(function(teamPlayerId) {
		if (staticData.guilds[this.players[teamPlayerId].guildId].players[this.players[teamPlayerId].playerId].hasOwnProperty('captain')) {
			countCaptainsFound++;
		}
		if (staticData.guilds[this.players[teamPlayerId].guildId].players[this.players[teamPlayerId].playerId].hasOwnProperty('mascot')) {
			countMascotsFound++;
		}
	}, this);
	return (Object.keys(this.players).length <= this.playerLimit && countCaptainsFound === 1 && (this.playerLimit < 4 || countMascotsFound === 1));
}