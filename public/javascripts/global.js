
// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load    
    $('body').on('click', '[data-action="pick-team"], .quiz-btn', fetchQuiz);
    $('body').on('click', '.twitter-login', openAuthPopup);
    $('body').on('click', '.close-auth', closePopupAndRefreshPage);
    $('body').on('click', '.tweet-btn', postToTwitter);
    $('body').on('click', '#email-btn', sendEmail);

    if (window.location.href.indexOf('auth') > -1){
      // let's just close the window for auth popup for them
      $('.close-auth').trigger('click');
    }
    
});

// Functions ============================================================= //

var roster = "#roster";

function sendEmail(event){
  var target = $(event.target),
      modal = target.closest('.modal-content'),
      sender = modal.find('#email-sender').val(),
      recipients = modal.find('#email-recipients').val(),
      message = modal.find('textarea#message').val();
      console.log(sender);


  var data = {
    sender: $.trim(sender),
    recipients: $.trim(recipients),
    subject: 'Take this Quiz from Rosterblitz',
    text_body: $.trim(message),
    html_body: '<p>' + $.trim(message) + '</p>'
  }

  var has_errors = validateInputs(data);


  if (!has_errors){

    $.ajax({
        url: 'teams/email',
        data: data,
        type: 'get',
        dataType: 'json',
          success: function(response){
            console.log('here');
          }
      })
  }

  $('#emailModal').modal('hide');
}

function validateInputs(data){
  var has_errors = false;
  if (data.sender.length < 1){
    has_errors = true;
  }
  var recipients_array = data.recipients.split(',');
  for (i = 0; i < recipients_array.length; i++){
    if (!validateEmail(recipients_array[i])){
      has_errors = true;
      return has_errors;
    }
  }
  if (data.text_body.length < 1){
    has_errors = true;
  }
  return has_errors;
}




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

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 



$('#copyright-date').text( (new Date).getFullYear() );







