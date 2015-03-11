    
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
    team_container = $('.team-container'),
    answer_container = $('.answer-container');


// DOM Ready =============================================================
$(document).ready(function() {

        console.log(bench);
        console.log(starters);


  

	$('body').on('keyup', '#guess-box', blake);
	$("#guess-box").focus();

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

        var dt2 = new Date(dt.valueOf() - 1000),
            temp = dt2.toTimeString().split(" "),
            ts = temp[0].split(":"),
            time = ts[1]+":"+ts[2];
        clock.html(time);
        if (time != '00:00'){
          setTimeout(startCounter, 1000);
        }
        else{
          // time is up, fill up the players and ship the score off to the BE
          for (var i=0; i < roster.length; i++){
            //populateTable takes in a player and maps it to the right spot, loop through and place them
            populateTable(roster[i]);
          }
          uploadScore(correct);
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
  
var blake = function(){
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
      player.guessed = true;
      correct++;
      populateTable(player);
      input_field.val('');
      team_container.find('.number').html(correct);
    }
  })
}

var populateTable = function(player){
  if (player.starter){
    var field = answer_container.find("[data-id='" + player.player_id + "']");
  }
  else{
    var field = answer_container.find('.bench .answer-row.empty').first();
  }
  field.html(player.full_name).addClass('rb-green').removeClass('empty');

}
//FUNCTIONS


    //client now has server-side players
// });   // DON'T KNOW HOW TO GET THESE VARIABLE SO DOING ALL ON READY NOW


// sort the players into the slots
	// get the top ten by games played
		// sort the two guards
	var findStartingGuards = function() {
		var allGuards = [];	
		for (i=0; i<roster.length; i++){		
			if (roster[i].position == "G") {				
				allGuards.push(roster[i]);							
			}
			console.log(allGuards)
		}
	}	
	/*
	var orderedCenters = allCenters.sort(function(a,b) { return parseFloat(a.total.games_started) - parseFloat(b.total.games_started) } );
	var startingCenterObject = orderedCenters.pop();
	var startingCenter = startingCenterObject.last_name;	
	console.log(startingGuards);
	return startingCenter;				
	}
  */

		// sort the two forwards


		// get the top center

var findCenter = function() {
	var allCenters = [];	
	for (i=0; i<roster.length; i++){		
		if (roster[i].position == "C" || roster[i].position == "F-C"){				
			allCenters.push(roster[i]);				
		}
	}	
	var orderedCenters = allCenters.sort(function(a,b) { return parseFloat(a.total.games_started) - parseFloat(b.total.games_started) } );
	var startingCenterObject = orderedCenters.pop();
	var startingCenter = startingCenterObject.last_name;	
	return startingCenter;				
	}





// detect the user typing the answer, done above in keyup event


// if the answer matches one, show the answer, delete the text

 
// placeholder bullshit

 var showTheRightOne = function() {
 findStartingGuards();	
 var center = findCenter();


 	var startingLineup = {
  	point:"stephen curry",
  	shooting:"thompson",
  	small:"barnes",
  	power:"green",
  	center: center.toLowerCase()
  }	


  var guess = $(".guess-box").val().toLowerCase();  	

 

  if (guess == startingLineup.point) {
  	$(".g1-name").show().text(startingLineup.point);  		
  	$(".guess-box").val("");  		
  } 
  if (guess == startingLineup.shooting) {
  	$(".g2-name").show().text(startingLineup.shooting);  		
  	$(".guess-box").val("");  
	}
	if (guess == startingLineup.small) {
  	$(".f1-name").show().text(startingLineup.small);  		
  	$(".guess-box").val("");  
	}
	if (guess == startingLineup.power) {
  	$(".f2-name").show().text(startingLineup.power);  		
  	$(".guess-box").val("");  
	}
	if (guess == startingLineup.center) {
  	$(".c-name").show().text(center);  		
  	$(".guess-box").val("");    	
	}
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

   

 
  // end henry shit