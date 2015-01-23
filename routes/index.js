
// DOM Ready =============================================================
$(document).ready(function() {
    console.log('ji');

    // Populate the user table on initial page load    
    $('body').on('click', '[data-action="pick-team"]', var details = fetchTeam;);
    
});

// Functions ============================================================= //


function fetchTeam(event) {
    var team = $('#teams option:selected').val();
    console.log(team);
    $.ajax({
      url: 'https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/583eca2f-fb46-11e1-82cb-f4ce4684ea4c/statistics.json?api_key=hdgj9e9vs9hquzc6ds22wtdy',
        success: function(response){
          formatRoster(response);
        }
    });

}

var formatRoster = function(response){
  //console.log(response);
  var team_deets = response;
  console.log(team_deets);
  // Sublayers of team_deets: id, market, name, opponents, own_record, players, season
  // Sublayers of Opponents: Average, Total
  // Sublayers of Own_Record: Average, Total
  // Sublayers of Players: (each player is an object in the array). --> average, total, first_name, full_name, id, jersey_number, last_name, position, primary_position
  // Sublayers of Season: id, type, year

  return team_deets;
}