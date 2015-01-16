
// DOM Ready =============================================================
$(document).ready(function() {
    console.log('ji');

    // Populate the user table on initial page load    
    $('body').on('click', '[data-action="pick-team"]', fetchTeam);

});

// Functions ============================================================= //


function fetchTeam(event) {
    var team = $('#teams option:selected').val();
    console.log(team);

}



