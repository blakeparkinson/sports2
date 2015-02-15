
// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load    
    $('body').on('click', '[data-action="pick-team"], .quiz-btn', fetchQuiz);
    $('body').on('click', '.twitter-login', openAuthPopup);
    $('body').on('click', '.tweet', openTweetPopup);
    $('body').on('click', '.facebook-login', openFacebookAuthPopup);
    $('body').on('click', '.facebook-post', openFacebookPostPopup);
    $('body').on('click', '.close-window', closePopup);
    $('body').on('click', '.tweet-btn', postToTwitter);
    $('body').on('click', '#email-btn', sendEmail);
    $('body').on('keyup', '.tweet-message', fetchCharacterCount);


    if (window.location.href.indexOf('auth') > -1){
      // let's just close the window for auth popup for them
      $('.close-auth').trigger('click');
    }

    $('body').on('hidden.bs.modal', '.modal', clearModal)

    $('body').on('click', '.email-img', appendMessage);


});

// Functions ============================================================= //

var roster = "#roster";
var modal = $('.modal');

function clearModal(){

  modal.find('#email-sender').val('');
  modal.find('#email-recipients').val('');
  modal.find('#message').val('');
  $(this).removeData('bs.modal');
}

function fetchCharacterCount(e){
  var char_count = ($(this).val().length),

      container = $(e.target).closest('.auth-container'),
      input = container.find('#char-count');
  input.val(char_count);

}


function appendMessage(event){

  modal.find('#message').val('I totally just dominated this quiz');
}

function sendEmail(event){
  var target = $(event.target),
      modal = target.closest('.modal-content'),
      sender = modal.find('#email-sender').val(),
      recipients = modal.find('#email-recipients').val(),
      message = modal.find('textarea#message').val();


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
  if (data.sender.length < 1 || data.text_body.length < 1 ){
    has_errors = true;
    return has_errors;
  }
  var recipients_array = data.recipients.split(',');
  for (i = 0; i < recipients_array.length; i++){
    if (!validateEmail(recipients_array[i])){
      has_errors = true;
      return has_errors;
    }
  }
  return has_errors;
}




function postToTwitter(e){
  container = $(e.target).closest('.auth-container'),
      tweet = container.find('.tweet-message').val();
  
  $.ajax({
      url: '/auth/maketweet',
      data: {message: tweet},
      type: 'get',
      dataType: 'json',
        success: function(response){
          var social = container.find('.social-section'),
          markup = $('<h2 class="share center">Thanks for tweeting about Rosterblitz!</h2>'+
            '<div class="btn btn-primary close-window">Close Window</div>');
          social.empty();
          social.append(markup);
          setTimeout(function(){
              window.close();
          }, 2000)
        }
    })

}
function fetchPopupDimensions(){
  //gotta do all this shit for dual screens
  var w = window.innerWidth/2;
 var h = window.innerHeight/2;
  var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var dimensions = {
      w: w,
      h: h,
      top:top,
      left: left
    }

    return dimensions;

}
//Twitter
function openAuthPopup(){
 var d = fetchPopupDimensions();
  var newWindow = window.open('auth/twitter', 'Log in with Twitter', 'scrollbars=yes, width=' + d.w + ', height=' + d.h + ', top=' + d.top + ', left=' + d.left);
  // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
}

function openTweetPopup(){
  
  var d = fetchPopupDimensions();
    var newWindow = window.open('auth/tweet', 'Share on Twitter','scrollbars=yes, width=' + d.w + ', height=' + d.h + ', top=' + d.top + ', left=' + d.left);

    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
}

//Facebook
function openFacebookAuthPopup(){
  //TODO center the popup in the screen
  window.open('auth/facebook', 'Log in with Facebook', 'width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=500,top=800');
}
function openFacebookPostPopup(){
  //TODO center the popup in the screen
  window.open('auth/posttofacebook', 'Share on Facebook', 'width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=500,top=800');
}


function closePopup(){
  
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
          window.location.href ='quiz?quiz_id=6'
     		}
    }).done(function() {
});

}

function fetchQuiz(event) {
    var target = $(event.target);
    if (target.hasClass('quiz-btn')){
      var team = $('.selected-team'),
          id = team.data('team-id'),
          league = team.data('league');

    }
    else{
      var team_id = $('#teams option:selected').val();
    }

    var data = {team_id: id, league: league};


    $.ajax({
      url: 'teams/quiz',
      data: data,
      type: 'get',
      dataType: 'json',
        success: function(response){
          window.location.href = 'quiz?quiz_id='+response[0]["_id"]+'&team_id='+response[0]["team_id"]+'&league='+response[0]["league"];
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







