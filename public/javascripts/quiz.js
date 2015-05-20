var roster,
    correct = 0,
    placer = 0,
    stop_counter = false;
    team_container = $('.team-container'),
    answer_container = $('.answer-container-contain');
if (typeof(roster) != undefined){
  roster = roster;
}

else{
  roster = [];
}

var card = $('.player-card');

// DOM Ready =============================================================
$(document).ready(function() {
  console.log(roster);
    
	$('body').on('keyup', '#guess-box', fetchGuess);
	$("#guess-box").focus();
  $('body').on('click', '.quit-btn', endQuiz);
  $('body').on('click', ".correct-guess:not('.no-flip')", showCard);
  $('#card').flip({trigger: 'manual'});
  $('body').on('mouseover', '.inner-guess', hoverCard);
  $('body').on('mouseout', '.inner-guess', removeHover)

  startCounter();
 });

var hoverCard = function(){
  var background = answer_container.data('bhex');
  var textColor = answer_container.data('fhex');
  $(this).css({"background-color":background, "color": textColor});
}

var removeHover = function(){
  $(this).css({"background":'inherit', "color": 'inherit'});
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

var uploadScore = function(correct_answers, percentage_correct){
  //get the quiz_id from the url
  var query_string = QueryString();
  var data = {
    quiz_id: query_string.id,
    quiz_score: correct_answers,
    possible_score: roster.length,
    percentage_correct: percentage_correct
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
    var last_name = '';
    var full_name = '';
    if (player.last_name !=undefined){
      last_name = player.last_name;
    }
    else if (player.full_last_name !=undefined){
      last_name = player.full_last_name;
    }
    if (player.full_name != undefined){
      full_name = player.full_name;
    }

    //hax for soccer. whatever
    else if (player.full_first_name != undefined){
      full_name = player.full_first_name;
    }

    var last_name = player.last_name != undefined? player.last_name : player.full_last_name;
    //check full name and just last name, also make sure the player has not been guessed already
    if ((guess == last_name.toLowerCase().trim() || guess == full_name.toLowerCase().trim()) && !player.guessed){
      appendGreenCheck(input_field);
      correct++;
      //populateTable(player);
      addToCorrectList(player, index);
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
 
var appendGreenCheck  = function(input_field){
  var glyc = input_field.closest('.form-group').find('.glyphicon');
  glyc.removeClass('hidden').show();
  glyc.fadeOut(2000);

}

var addToCorrectList = function (player, index){
  if (player.guessed == true) return;
  placer++;
  var imgHtml = '';
  if (typeof player.avatar_url != 'undefined'){
    imgHtml = '<img class="circle-pic" src='+player.avatar_url+'>';
  }
  if (type != 'leaders' && type != 'goats' ){
    var html = '<div class="outer-guess"><div class="inner-guess"><div class="correct-guess" data-index="'+index+'">'+placer +'.' + imgHtml + player.full_name + '</div></div></div>';
    answer_container.append(html);
    var current = answer_container.find('.correct-guess[data-index="' + index + '" ]').closest('.outer-guess');
    current.hide();
    current.fadeIn(200).addClass('green-background');
  }
  else{
    //goats and leaders
    var playerBox = answer_container.find('.correct-guess[data-player-id='+player.player_id+']');
    playerBox.removeClass('no-flip');
    var playerHtml = imgHtml + player.full_name;
    playerBox.append(playerHtml);
    playerBox.closest('.outer-guess').fadeIn(200).addClass('green-background');
  }
}

var populateTable = function(player, class_color){
  if (player.guessed) return;
  prepareCard(player);
}

//show the card when clicked from sidebar
var showCard = function(e){
  var index = $(this).data('index');
  prepareCard(roster[index], true);
}

var prepareCard = function(player, flip){
  var full_name = '';
  if (player.full_name){
    full_name = player.full_name;
  }
  else if (player.first_name && player.last_name){
    full_name = player.first_name + ' ' + player.last_name;
  }
  else if (player.full_first_name){
    full_name = player.full_first_name;
  }
  player.team_name = team_name;
  player.league = league;
  var source   = $("#full-card");
  AppendTemplate(source, card, player);
  if (flip){
    $("#card").flip(true);
  }

}

var AppendTemplate = function(source, parent, data){
  var source   = source.html();
  var template = Handlebars.compile(source);
  parent.empty();
  var html = template(data);
  parent.append(html);
    $(parent).on('click', '.back-to-answer', function(){$("#card").flip(false);});

}

var endQuiz = function(e, skip_mapping){
  percent = +((correct / roster.length).toFixed(2));
  console.log("percent "+ percent);
  $('#also-might-like').show();
  stop_counter = true;
  team_container.find('.clock').text('00:00');
  if (!skip_mapping){
    for (var i=0; i < roster.length; i++){
      //populateTable takes in a player and maps it to the right spot, loop through and place them
      addToCorrectList(roster[i], i);
    }
  }
  //remove the quit button
  team_container.find('.quit-btn').remove();
  uploadScore(correct, percent);
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

var getTemplate = function(name, data, options){

    templates = {},

    $.post('/index/get/' + name, data, function(d){
        
        templates[name] = d;
        
        tpl = processTemplate(d, data, options); 


        return tpl;

    }); 
                   
  }

  var processTemplate = function(template, data, options){

        var tpl = Handlebars.compile(template, options),
            compiled;

        data ? compiled = tpl(data) : compiled = tpl({});

        return compiled;

    }
