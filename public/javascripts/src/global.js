
// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load    
    $('body').on('click', '[data-action="pick-team"], .quiz-btn', fetchQuiz);
    $('body').on('click', '.create-quiz', fetchTrendingQuiz);
    $('body').on('click', '.twitter-login', openAuthPopup);
    $('body').on('click', '.tweet', openTweetPopup);
    $('body').on('click', '.facebook-login', openFacebookAuthPopup);
    $('body').on('click', '.facebook-post', openFacebookPostPopup);
    $('body').on('click', '.close-auth', closePopupAndRefreshPage);
    $('body').on('click', '.post-social', postSocial);
    $('body').on('click', '#email-btn', sendEmail);
    $('body').on('click', '.close-window', function(){window.close()});

    if (window.location.href.indexOf('auth') > -1){
      // let's just close the window for auth popup for them
      setTimeout(function(){
        window.close();
         }, 2000)
    }

    $('body').on('hidden.bs.modal', '.modal', clearModal)

    $('body').on('click', '.email-img', appendMessage);
    
    $(document).keypress(function(event){ 
      var keycode = (event.keyCode ? event.keyCode : event.which);
      if(keycode == '13'){
         $("#take-quiz-button").trigger('click');
      }     
    });
    

});

// Functions ============================================================= //


var modal = $('.modal');

function clearModal(){

  modal.find('#email-sender').val('');
  modal.find('#email-recipients').val('');
  modal.find('#message').val('');
  $(this).removeData('bs.modal');
}


function appendMessage(event){
  if (typeof teamId != 'undefined' && typeof team_name != 'undefined'){
    var message = 'Try to beat my score of {{' +correct+'}} on this ' + team_name + ' quiz: https://www.rosterbliz.com?team_id=Qknb0gNGL1x';
  } 
  else{
    var message = 'Thought you might enjoy some sports quizzes at rosterbliz.com.';
  }
  modal.find('#message').val(message);
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


function postSocial(event){

  var target = $(event.target),
    d = fetchPopupDimensions();
    if (target.closest('.social').hasClass('social-sidebar')){
      title = target.closest('.social-sidebar').data('title');
    }
    else{
      title = target.closest('.social-chart').data('title');
    }

  if (target.attr('id') == 'twitter'){
    window.open('https://twitter.com/share?text='+title+'&url='+window.location.href+'', 'Share a quiz on twitter', 'scrollbars=yes, width=' + d.w + ', height=' + d.h + ', top=' + d.top + ', left=' + d.left);
  }

  else{
    // it's teh facebook
    window.open('https://www.facebook.com/dialog/share?app_id=1600051886893474&href=www.rosterbliz.com&display=popup&redirect_uri=http://localhost:3000/auth/social','', 'scrollbars=yes, width=' + d.w + ', height=' + d.h + ', top=' + d.top + ', left=' + d.left);
  }

}


//Twitter
function openAuthPopup(){
  //TODO center the popup in the screen
  window.open('auth/twitter', 'Log in with Twitter', 'width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=500,top=800');
}

function openTweetPopup(){
  //TODO center the popup in the screen
  window.open('auth/tweet', 'Share on Twitter', 'width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=500,top=800');
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


function closePopupAndRefreshPage(){
  /*
  window.opener.location.reload(true);
  window.close();
  */
}

function fetchTrendingQuiz(event){
  var team_id = $(this).data('team-id'),
    type = $(this).data('type');

  var data = {
    team_id: team_id,
    type: type,
    trending: true
  };
  AjaxCreateQuiz(data);
}



function fetchQuiz(event) {
    var target = $(event.target);
    var team = $('.selected-team');

    if (team.length){
      var api_team_id = team.data('api-team-id'),
          league = team.data('league'),
          type = team.data('type'),
          team_id = team.data('team-id');
          if (team.data('category')){
            var team_name = team.data('category');
          }
          else{
            var team_name = team.data('team');
          }     

      var data = {
        api_team_id: api_team_id, 
        league: league, 
        team_id: team_id, 
        team_name: team_name,
        type: type
      };

      AjaxCreateQuiz(data);
    }

    else{
      //show a warning to select a team
      $('#selectTeamModal').modal('show');
    }
}

function AjaxCreateQuiz(data){
  var url = window.location.pathname.split("/");
  if (url.length > 2){
    //we are in an action page (i.e. leaguesearch/nba, go up a level)
    var ajax_url = '../teams/quiz'
  }
  else{
    var ajax_url = 'teams/quiz'
  }

    $.ajax({
      url: ajax_url,
      data: data,
      type: 'get',
      dataType: 'json',
        success: function(response){
          if (!response.error){
            window.location.href = '../quiz?id='+response["_id"]+'&team_id='+response["team_id"]+'&league='+response["league"];
          }
          else{console.log('Throw an error popup or smething eventually');}
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
