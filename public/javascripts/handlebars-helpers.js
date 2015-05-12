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
});

Handlebars.registerHelper('format_height', function(heightInches){
  if (!parseInt(heightInches)) return '';
  if (arguments.length < 1) {
        throw new Error("Handlerbars Helper 'format_height' needs 2 parameters");
    }
  var feet = Math.floor(heightInches / 12);
  var inches =  heightInches % 12;
  var americanHeight = feet + "'" + inches + "\"";
  return americanHeight;
});

Handlebars.registerHelper('percentageCalc', function(denominator, numerator){
  if (arguments.length < 1) {
        throw new Error("Handlerbars Helper 'percentageCalc' needs 2 parameters");
    }
  var percentage = numerator/denominator; 
  percentage = percentage * 100;
  percentage = percentage.toFixed(1);

  if (isNaN(percentage) || (percentage < 10)) {
    percentage = "N/A";
  } else {
    percentage = percentage + "%";
  }
  return percentage;
});

Handlebars.registerHelper('abridgeSalary', function(salary){
  if (arguments.length < 1) {
        throw new Error("Handlerbars Helper 'abridgeSalary' needs 1 parameter");
    }
  console.log(salary);
  if (salary === undefined) {
    var newSalary = "Not available";
  }
  else {
    var salaryLong = salary;
    var salaryLong = salaryLong.replace("$", "");
    var asString = String(salaryLong);
    if (salaryLong.length === 8) {          
      var one = asString.charAt(0);
      var two = asString.charAt(1);
      var three = asString.charAt(2);    
      var newSalary = "$" + one + two + "." + three + "M";   
    }    
    else if (salaryLong.length === 7) {      
      var one = asString.charAt(0);
      var two = asString.charAt(1);  
      var newSalary = "$" + one + "." + two + "M";  
    } else if (salaryLong.length === 6) {      
      var one = asString.charAt(0);
      var two = asString.charAt(1);
      var three = asString.charAt(2);
      var newSalary = "$" + one + two + three + "K";   
    } else if (salaryLong.length === 5) {      
      var one = asString.charAt(0);
      var two = asString.charAt(1);
      var newSalary = "$" + one + two + "K";   
    }
      else {
      var newSalary = "Not available";
    }
  }
  return newSalary;
});