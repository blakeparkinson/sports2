
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
      var team = $('.selected-team'),
          id = team.data('id'),
          team_id = team.data('team-id');

    }
    else{
      var team_id = $('#teams option:selected').val();
    }


    $.ajax({
     	url: 'teams/players',
      data: {team_id: team_id},
      type: 'get',
      dataType: 'json',
     		success: function(response){
          console.log("this is the response"+response);
     		}
    }).done(function() {
  alert("DONE!");
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









