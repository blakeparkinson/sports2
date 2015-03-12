
var starters,bench;
if (typeof(starters) != undefined){
  starters = starters;
}

else{
  starters = [];
}

if (typeof(bench) != undefined){
  bench = bench;
}

else{
  bench = [];
}

var roster = starters.concat(bench),
    correct = 0,
    stop_counter = false;
    team_container = $('.team-container'),
    answer_container = $('.answer-container');


// DOM Ready =============================================================
$(document).ready(function() {

        console.log(bench);
        console.log(starters);


  

	$('body').on('keyup', '#guess-box', fetchGuess);
	$("#guess-box").focus();
  $('body').on('click', '.quit-btn', endQuiz);


  startCounter();
 });

var startCounter = function(){
  var clock = $('.clock');
      if (clock.length){
        var time = clock.html(),
          ss = time.split(":"),
          dt = new Date();
          dt.setHours(0);
          dt.setMinutes(ss[0]);
          dt.setSeconds(ss[1]);

        if (time != '00:00'){
          var dt2 = new Date(dt.valueOf() - 1000),
              temp = dt2.toTimeString().split(" "),
              ts = temp[0].split(":"),
              time = ts[1]+":"+ts[2];
              clock.html(time);
              setTimeout(startCounter, 1000);
        }
        else{
          var input = team_container.find('#guess-box');
          input.prop('readonly', true);
          // time is up, fill up the players and ship the score off to the BE
          if (!stop_counter){
            endQuiz();
          }
        }
      }

}

var uploadScore = function(correct_answers){
  //get the quiz_id from the url
  var query_string = QueryString();
  var data = {
    quiz_id: query_string.id,
    quiz_score: correct_answers
  };


  $.ajax({
      url: 'quiz/results',
      data: data,
      type: 'get',
      dataType: 'json',
        success: function(response){
          alert(response);
        }
    });

}
  
var fetchGuess = function(){
  var guess = $(this).val().toLowerCase().trim(),
      target = $(event.target);
  if (guess.length > 2){
      checkForMatches(guess, target);

  }
}

var checkForMatches = function(guess, input_field){
  _.each(roster, function(player, index){
    //check full name and just last name, also make sure the player has not been guessed already
    if ((guess == player.last_name.toLowerCase().trim() || guess == player.full_name.toLowerCase().trim()) && !player.guessed){
      correct++;
      populateTable(player);
      input_field.val('');
      team_container.find('.number').html(correct);
      player.guessed = true;
      if (correct == roster.length){
        //user has finished the quiz and answered everthing
        endQuiz(event,true);
      }
    }
  })
}

var populateTable = function(player){
  if (player.guessed) return;
  if (player.starter){
    var field = answer_container.find("[data-id='" + player.player_id + "']");
  }
  else{
    var field = answer_container.find('.bench .answer-row.empty').first();
  }
  field.html(player.full_name).addClass('rb-green').removeClass('empty');

}

var endQuiz = function(e, skip_mapping){
  stop_counter = true;
  team_container.find('.clock').text('00:00');
  if (!skip_mapping){
    for (var i=0; i < roster.length; i++){
      //populateTable takes in a player and maps it to the right spot, loop through and place them
      populateTable(roster[i]);
    }
  }
  //remove the quit button
  team_container.find('.quit-btn').remove();
  uploadScore(correct);
}

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
} 
