
// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load    
    $('body').on('click', '[data-action="pick-team"], .quiz-btn', fetchTeam);

    
});

// Functions ============================================================= //

var roster = "#roster";

function fetchTeam(event) {
    var target = $(event.target);
    if (target.hasClass('quiz-btn')){
      var team = $('.selected-team').data('id');
    }
    else{
      var team = $('#teams option:selected').val();
    }

    console.log(team);
    $.ajax({
     	url: 'https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+team+'/statistics.json?api_key=hdgj9e9vs9hquzc6ds22wtdy',
     		success: function(response){
     		 	details = formatRoster(response);
          detailsP = formatPlayers(response);
                console.log(detailsP);
                return details;
     		}
    });

}

var formatRoster = function(response){
	var team_deets = sortTeam(response),
      source = $("#team").html(),
      template = Handlebars.compile(source);

  $(roster).empty().append(template(team_deets));
	return team_deets;
}

var sortTeam = function(team_name){
    team_name.players.sort(compare)
    return team_name;

}

// Sort team in order of most starts to least starts
function compare(a,b) {
  if (a.total.games_started > b.total.games_started)
     return -1;
  if (a.total.games_started < b.total.games_started)
    return 1;
  return 0;
}


var formatPlayers = function(response){
  playersarray = [];
  for (i=0;i<response.players.length;i++){
    playersarray[i] = {};
    for(var key in response.players[i]){
      if (key != "total" && key != "average"){
        var value = response.players[i][key];
        playersarray[i][key] = value;
      }
      else if (key =="total"){
        for(var key in response.players[i].total) {
          var value = response.players[i].total[key];
          playersarray[i]["total_"+key] = value;
        }
      }
      else {
        for(var key in response.players[i].average) {
          var value = response.players[i].average[key];
          playersarray[i]["average_"+key] = value;
        }
      }
    }
  }
  return playersarray;
}







