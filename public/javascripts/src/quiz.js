var roster,
    correct = 0,
    placer = 0,
    stop_counter = false;
    team_container = $('.team-container'),
    answer_container = $('.answer-container-contain');

//CHART COLORS

var shighHex = '#C56363',
    highHex  = '#FFAB45',
    mhighHex = '#FFFF59',
    medHex   = '#B7CA85',
    mlowHex  = '#46BFBD',
    lowHex   = '#8C33B7';



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
  var columnsSelector = $('.columns');

	$(columnsSelector).on('keyup', '#guess-box', fetchGuess);
	$("#guess-box").focus();
  $(columnsSelector).on('click', '.quit-btn', endQuiz);
  $(columnsSelector).on('click', ".correct-guess:not('.no-flip')", showCard);
  $('#card').flip({trigger: 'manual'});
  $(columnsSelector).on('mouseover', ".inner-guess.guessed:not('.no-hover')", hoverCard);
  $(columnsSelector).on('mouseout', '.inner-guess.guessed', removeHover)
  $('#graphModal').modal({ show: false})

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

var uploadScore = function(correct_answers){
  //get the quiz_id from the url
  var query_string = QueryString();
  var data = {
    quiz_id: query_string.id,
    league: query_string.league,
    quiz_score: correct_answers,
    possible_score: roster.length
  };


  $.ajax({
      url: 'quiz/results',
      data: data,
      type: 'get',
      dataType: 'json',
      success: showGraphModal
    });

}

var getLegendLabel = function(category){
  var label = '';
  if (league != 'nfl'){
    switch(category){
      case 'shigh':
        label = '15+';
        break;
      case 'high':
        label = '12-14';
        break;
      case 'mhigh':
        label = '9-11';
        break;
      case 'med':
        label = '6-8';
        break;
      case 'mlow':
        label = '3-5';
        break;
      case 'low':
        label = '2 or Fewer';
        break;
    }
  }
  else{
    switch(category){
      case 'shigh':
        label = '25+';
        break;
      case 'high':
        label = '20-24';
        break;
      case 'mhigh':
        label = '15-19';
        break;
      case 'med':
        label = '10-14';
        break;
      case 'mlow':
        label = '5-9';
        break;
      case 'low':
        label = '5 or Less';
        break;
    }
  }
  return label;
}

var showGraphModal = function(response){
  response.correct = correct;
  response.team_name = team_name;
  response.logo_url = logo_url;
  response.shortPercentile = percentileEndingText(response.scores.percentile.toFixed(0));
  response.labelColor = getSpanColor(correct);
  response.teamId = teamId
  var source   = $("#quiz-graph"),
      parent = $('#graphModal');
    AppendTemplate(source, parent, response, function(){
      $('#graphModal').modal('show');
      $('#graphModal').on('shown.bs.modal', function(event){
             //draws the chart on the canvas element
        var data = [
            {
                value: response.scores.brackets.high,
                color: highHex,
                label: getLegendLabel('high')
            },
            {
                value: response.scores.brackets.mhigh,
                color: mhighHex,
                label: getLegendLabel('mhigh')
            },
            {
                value: response.scores.brackets.med,
                color: medHex,
                label: getLegendLabel('med')
            },
            {
                value: response.scores.brackets.mlow,
                color: mlowHex,
                label: getLegendLabel('mlow')
            },
            {
                value: response.scores.brackets.low,
                color: lowHex,
                label: getLegendLabel('low')
            }
        ];

        //only append the 15+ section if there are actually 15+ players
        if (roster.length > 14){
          data.unshift({
                value: response.scores.brackets.shigh,
                color: shighHex,
                label: getLegendLabel('shigh')
            });
        }
        var options = {
            segmentShowStroke : true,
            percentageInnerCutout : 65,
            showTooltips: false,
            responsive: true,
            animationSteps: 100,
            animationEasing: 'easeOutQuart',

        };
        var t = document.getElementById("chart");
        var ctx = document.getElementById("chart").getContext("2d");
        var donutChart = new Chart(ctx).Doughnut(data,options);
        legend(document.getElementById("chartLegend"), data, donutChart);
        var client = new ZeroClipboard($("[data-clipboard-text]"));
        parent.on('click', '.share-this', activeCopyButton)


      })
    });

}

var activeCopyButton = function(){
  $(this).text('Copied').addClass('copied');
}

function getSpanColor(score){
  if (league == 'nfl'){
    score = score / 5
  }else{score = score/3 }
  var color = '#fff';
  switch (true){
    case (score < 1):
      color = lowHex;
      break;
    case (score >= 0.1 && score < 2 ):
      color= mlowHex;
      break;
    case (score >= 2 && score < 3):
      color= medHex;
      break;
    case (score >= 3 && score < 4 ):
      color= mhighHex;
      break;
    case (score >= 4 && score < 5):
      color= highHex;
      break;
    case (score >= 5):
      color= shighHex;
      break;
  }
  return color;
}

function legend(parent, data) {
    legend(parent, data, null);
}

function legend(parent, data, chart) {
    parent.className = 'legend';
    var datas = data.hasOwnProperty('datasets') ? data.datasets : data;

    // remove possible children of the parent
    while(parent.hasChildNodes()) {
        parent.removeChild(parent.lastChild);
    }

    var show = chart ? noop : noop;
    var subheader = document.createElement('div');
      subheader.className ='legend-header';
      subheaderText = document.createTextNode('Players Guessed');
    subheader.appendChild(subheaderText);
    parent.appendChild(subheader);
    datas.forEach(function(d, i) {
        //span to div: legend appears to all element (color-sample and text-node)
        var title = document.createElement('div');
        title.className = 'title';
        parent.appendChild(title);

        var colorSample = document.createElement('div');
        colorSample.className = 'color-sample';
        colorSample.style.backgroundColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
        colorSample.style.borderColor = d.hasOwnProperty('fillColor') ? d.fillColor : d.color;
        title.appendChild(colorSample);

        var text = document.createTextNode(d.label);
        text.className = 'text-node';
        title.appendChild(text);

        show(chart, title, i);
    });
}

//add events to legend that show tool tips on chart
function showTooltip(chart, elem, indexChartSegment){
    var helpers = Chart.helpers;

    var segments = chart.segments;
    //Only chart with segments
    if(typeof segments != 'undefined'){
        helpers.addEvent(elem, 'mouseover', function(){
            var segment = segments[indexChartSegment];
            segment.save();
            segment.fillColor = segment.highlightColor;
            chart.showTooltip([segment]);
            segment.restore();
        });

        helpers.addEvent(elem, 'mouseout', function(){
            chart.draw();
        });
    }
}

function noop() {}
  
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
    current.find('.inner-guess').addClass('guessed');
    current.hide();
    current.fadeIn(200).addClass('green-background');
  }
  else{
    //goats and leaders
    if (player.stat < 1) {
      var statAsPerc = (player.stat * 100);
      var statAsPerc = statAsPerc.toFixed(1) + "%";
    } else {
      var statAsPerc = player.stat;
    }    
    var statHtml = '<span class="stat">'+statAsPerc+'</span>';
    var playerBox = answer_container.find('.correct-guess[data-player-id='+player.player_id+']');
    //playerBox.removeClass('no-flip');
    var playerHtml = imgHtml + player.full_name;
    playerBox.append(playerHtml);
    playerBox.parent().append(statHtml).addClass('guessed no-hover');
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
  $(card).on('click', '.back-to-answer', function(){$("#card").flip(false);});
  if (flip){
    $("#card").flip(true);
  }

}

var AppendTemplate = function(source, parent, data, callback){
  var source   = source.html();
  var template = Handlebars.compile(source);
  parent.empty();
  var html = template(data);
  parent.append(html);
  if (callback)callback();
}

var endQuiz = function(e, skip_mapping){
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

var percentileEndingText = function(percentile){
  var lastDigit = percentile % 10,
      text = '';
  switch (lastDigit){
    case 0:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      text = 'th';
      break;
    case 1:
      text ='st';
      break;
    case 2:
      text = 'nd';
      break;
    case 3:
      text = 'rd';
      break;
  }
  return (percentile+text);
}
