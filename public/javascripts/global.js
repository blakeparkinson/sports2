
// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load    
    $('body').on('click', '[data-action="pick-team"], .quiz-btn', fetchQuiz);
    $('body').on('click', '.twitter-login', openAuthPopup);
    $('body').on('click', '.close-auth', closePopupAndRefreshPage);
    $('body').on('click', '.tweet-btn', postToTwitter);

    if (window.location.href.indexOf('auth') > -1){
      // let's just close the window for auth popup for them
      $('.close-auth').trigger('click');
    }
    
});

// Functions ============================================================= //

var roster = "#roster";


function postToTwitter(){
  $.ajax({
      url: 'auth/tweet',
      data: {message: 'From Rosterblitz. GLASSMAN GOAT 4/20'},
      type: 'get',
      dataType: 'json',
        success: function(response){
          console.log('here');
        }
    })
}

function openAuthPopup(){
  //TODO center the popup in the screen
  window.open('auth/twitter', 'Log in with Twitter', 'width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=500,top=800');
}

function closePopupAndRefreshPage(){
  window.opener.location.reload(true);
  window.close();
}

function fetchTeam(event) {
    var target = $(event.target);
    if (target.hasClass('quiz-btn')){
      var team = $('.selected-team'),
          id = team.data('id'),
          team_id = team.data('team-id'),
          league = team.data('league');

    }
    else{
      var team_id = $('#teams option:selected').val();
    }

    var data = {team_id: team_id, league: league};

    $.ajax({
     	url: 'teams/players',
      data: data,
      type: 'get',
      dataType: 'json',
     		success: function(response){
          console.log("this is the response"+response);
     		}
    }).done(function() {
});

}

function fetchQuiz(event) {
    var target = $(event.target);
    if (target.hasClass('quiz-btn')){
      var team = $('.selected-team'),
          id = team.data('id');

    }
    else{
      var team_id = $('#teams option:selected').val();
    }

    var data = {id: id};


    $.ajax({
      url: 'teams/quiz',
      data: data,
      type: 'get',
      dataType: 'json',
        success: function(response){
          console.log("this is the response"+response);
        }
    }).done(function() {
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



$('#copyright-date').text( (new Date).getFullYear() );







