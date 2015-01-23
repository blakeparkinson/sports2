
// DOM Ready =============================================================
$(document).ready(function() {
    console.log('ji');

    // Populate the user table on initial page load    
    $('body').on('click', '[data-action="pick-team"]', fetchTeam);
    
});

// Functions ============================================================= //

var roster = "#roster";

function fetchTeam(event) {
    var team = $('#teams option:selected').val();
    $.ajax({
     	url: 'https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+team+'/statistics.json?api_key=hdgj9e9vs9hquzc6ds22wtdy',
     		success: function(response){
     		 	details = formatRoster(response);
                console.log(details);
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











