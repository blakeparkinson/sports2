    
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
        $.getScript("../../../lists/ppg_alltime.js", function(){
          console.log('done');  
        });


  

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

   