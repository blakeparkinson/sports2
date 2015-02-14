    
var players;
// DOM Ready =============================================================
$(document).ready(function() {

    if (typeof(players) != undefined){
    	var roster = players;
    }else{
    	var roster = {};
    }

    //client now has server-side players
    console.log(roster);
});