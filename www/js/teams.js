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

Team.prototype.addPlayer = function(playerID) {
	this.players[generateUUID()] = {'playerID': playerID};
}

Team.prototype.getPlayerName = function(teamPlayerID) {
	return staticData.guilds[this.guild].players[this.players[teamPlayerID].playerID].name;
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

Team.prototype.isComplete = function() {
	var countCaptainsFound = 0;
	var countMascotsFound = 0;
	Object.keys(this.players).forEach(function(teamPlayerID) {
		if (staticData.guilds[this.guild].players[this.players[teamPlayerID].playerID].hasOwnProperty('captain')) {
			countCaptainsFound++;
		}
		if (staticData.guilds[this.guild].players[this.players[teamPlayerID].playerID].hasOwnProperty('mascot')) {
			countMascotsFound++;
		}
	});
	return (this.players.length <= this.playerLimit && countCaptainsFound === 1 && countMascotsFound === 1);
}