
// DOM Ready =============================================================
$(document).ready(function() {
    console.log('ji');

    // Populate the user table on initial page load    
    $('body').on('click', '[data-action="pick-team"]', fetchTeam);
    
});

// Functions ============================================================= //


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
	var team_deets = response,
      source = $("#team").html(),
      template = Handlebars.compile(source);
      console.log(team_deets);

  $("#roster").append(template(team_deets));
	return team_deets;
}



