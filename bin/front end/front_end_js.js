$( document ).ready(function() {
   $(".nice").hide();


  var warriors = {
  	point:"curry",
  	shooting:"thompson",
  	small:"barnes",
  	power:"green",
  	center:"bogut"
  }


	
	var checkTheName = function() {					
		$.each(warriors, function(key, twoName){			
			if (twoName == warriors.point) {
				showTheNice();
			}		
			else {
				$(".nice2").hide();
			}

		});
	}


	var showTheNice = function() {
	$(".nice2").show();
	}	

 $('body').on('keyup', '.2', showTheNice);
 $('body').on('keyup', '.2', checkTheName);



});


// check if the user typed a letter



// check if the text in the box is equal to the player's checkTheName