Handlebars.registerHelper('render_position', function(league, position){
  if (arguments.length < 2) {
        throw new Error("Handlerbars Helper 'render_position' needs 2 parameters");
    }

  var position = position.toUpperCase();
  switch (league){
    case 'nba':
      switch (position){
        case 'G':
          position = 'Guard';
        break;
        case 'F':
          position = 'Forward';
        break;
        case 'C':
          position = 'Center';
        break;
        case 'F-C':
        case 'C-F':
         position = 'Forward/Center';
        break;
        case 'G-F':
        case 'F-G':
         position = 'Guard/Forward';
        break;
      }
    break;
    case 'eu_soccer':
      switch (position){
        case 'D': 
          position = 'Defender';
        break;
        case 'F':
          position = 'Forward';
        break;
        case 'M':
          position = 'Midfielder';
        break;
        case 'G':
          position = 'Goalie';
        break;

      }
      break;
    case 'nhl':
      switch(position){
        case 'D':
          position = 'Defence';
        break;
        case 'F':
          position = 'Forward';
        break;
        case 'G':
          position = 'Goalie';
        break;
      }
    break;
  }
  return position;
})