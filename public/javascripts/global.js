
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
      url: 'https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/583eca2f-fb46-11e1-82cb-f4ce4684ea4c/statistics.json?api_key=hdgj9e9vs9hquzc6ds22wtdy',
      success: function(response){
        console.log(response);
        formatRoster(response);
      }
    });

}

var formatRoster = function(response){
    console.log(response);
}



