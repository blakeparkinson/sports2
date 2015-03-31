var starters,bench, roster,
    correct = 0,
    stop_counter = false;
    team_container = $('.team-container'),
    answer_container = $('.answer-container');
if (typeof(roster) != undefined){
  roster = roster;
}

else{
  roster = [];
}

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

console.log(bench); console.log(starters); console.log(roster);
if (typeof bench != "undefined" && typeof starters != "undefined"){
  roster = starters.concat(bench);
}    

else{
  roster = [];
}


// DOM Ready =============================================================
$(document).ready(function() {
    
  randImg();
	$('body').on('keyup', '#guess-box', fetchGuess);
	$("#guess-box").focus();
  $('body').on('click', '.quit-btn', endQuiz);


  startCounter();
 });

var randImg = function() {
 var imgCount = 8;
      var dir = '../images/stadiums/nba_stadiums/';
      var randomCount = Math.round(Math.random() * (imgCount - 1)) + 1;
      var images = new Array
              images[1] = "NBA-kings-stadium.jpg",
              images[2] = "NBA-bucks-stadium.jpg",
              images[3] = "NBA-warriors-stadium.jpg",
              images[4] = "NBA-pelicans-stadium.jpg",
              images[5] = "NBA-hornets-stadium.jpg",
              images[6] = "NBA-rockets-stadium.jpg",
              images[7] = "NBA-knicks-stadium.jpg",
              images[8] = "NBA-heat-stadium.jpg",
      $("#standard-nba-container").style.backgroundImage = "url(" + dir + images[randomCount] + ")"; 
}

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
          console.log(response);
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

var populateTable = function(player, class_color){
  if (player.guessed) return;

  var class_name = class_color !== undefined ? class_color : 'rb-green';
  if (player.starter){
    var field = answer_container.find("[data-id='" + player.player_id + "']");
    var img_html =  '<img class="circle-pic" src='+player.avatar_url+'>';

    field.prepend(img_html);
    field.find('.answered-player').html(player.full_name);
  }
  else{
    var field = answer_container.find('.bench .answer-row.empty').first();
    field.html(player.full_name);
  }
  field.addClass(class_name).removeClass('empty');

}

var endQuiz = function(e, skip_mapping){
  stop_counter = true;
  team_container.find('.clock').text('00:00');
  if (!skip_mapping){
    for (var i=0; i < roster.length; i++){
      //populateTable takes in a player and maps it to the right spot, loop through and place them
      var class_color = 'rb-red';
      populateTable(roster[i], class_color);
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
