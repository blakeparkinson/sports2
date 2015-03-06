    
var starters,bench;
if (typeof(starters) != undefined){
  starters = starters;
}

else{
  starters = {};
}

if (typeof(bench) != undefined){
  bench = bench;
}

else{
  bench = {};
}

// DOM Ready =============================================================
$(document).ready(function() {

        console.log(bench);
        console.log(starters);


  

	$('body').on('keyup', '.guess-box', blake);
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
            ts = temp[0].split(":");
        clock.html(ts[1]+":"+ts[2]);
        setTimeout(startCounter, 1000);
      }

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
      input_field.val('');

    }
  })
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

   

 
  // end henry shit