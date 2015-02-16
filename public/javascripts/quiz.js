    
var players;
// DOM Ready =============================================================
$(document).ready(function() {

    if (typeof(players) != undefined){
    	var roster = players;
    }else{
    	var roster = {};
    }

  

	$('body').on('keyup', '.guess-box', showTheRightOne);
	
});


	



    //client now has server-side players
    console.log(roster);
// });   // DON'T KNOW HOW TO GET THESE VARIABLE SO DOING ALL ON READY NOW


// sort the players into the slots
	// get the top ten by games played
		// sort the two guards
		 var findName = function() {
  		for (i=0; i<roster.length; i++){
  			if (roster[i].last_name == "Curry") {  	
  				}
  		}
  	}
  

		// sort the two forwards


		// get the top center

var findCenter2 = function() {
	$.each(roster, function(key, value){		
		console.log(key + " " + value);
	})
}


var findCenter = function() {
	for (i=0; i<roster.length; i++){		
		if (roster[i].position == "C" || roster[i].position == "F-C"){
			var allCenters = "";
			allCenters += roster[i].last_name;	
			console.log(allCenters);

			/* this part doesn't work
			var sortable = [];
			for (jersey_number in allCenters) 
      sortable.push([jersey_number, allCenters[jersey_number]])     
			sortable.sort(function(a, b) {return a[1] - b[1]})
			*/
			
			}	
		}		
	}




findCenter();
// detect the user typing the answer, done above in keyup event


// if the answer matches one, show the answer, delete the text

 


 var showTheRightOne = function() {

 	var warriors = {
  	point:"curry",
  	shooting:"thompson",
  	small:"barnes",
  	power:"green",
  	center:"bogut"
  }	

  var guess = $(".guess-box").val();  	

  if (guess == warriors.point) {
  	$(".g1-name").show().text(warriors.point);  		
  	$(".guess-box").val("");  		
  } 
  if (guess == warriors.shooting) {
  	$(".g2-name").show().text(warriors.shooting);  		
  	$(".guess-box").val("");  
	}
	if (guess == warriors.small) {
  	$(".f1-name").show().text(warriors.small);  		
  	$(".guess-box").val("");  
	}
	if (guess == warriors.power) {
  	$(".f2-name").show().text(warriors.power);  		
  	$(".guess-box").val("");  
	}
	if (guess == warriors.center) {
  	$(".c-name").show().text(warriors.center);  		
  	$(".guess-box").val("");  
	}
}

   

 


 
 // });
  

 
  // end henry shit