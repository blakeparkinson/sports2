$( document ).ready(function() {
   $(".nice").hide();


  var warriors = {
  	point:"curry",
  	shooting:"thompson",
  	small:"barnes",
  	power:"green",
  	center:"bogut"
  }	


  var showTheRightOne = function() {
  	var guess = $(".guess-box").val();
  	console.log(guess);
  	if (guess == warriors.point) {
  		$(".pg-hide").show().text(warriors.point);  		
  		$(".guess-box").val('');  		
  	}  
  }
  

  

	$('body').on('keyup', '.guess-box', showTheRightOne);


	});
