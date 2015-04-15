
// var popular_teams = {{league}};
// console.log(popular_teams);
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

$(function () {
  $('[data-toggle="popover"]').popover()
});
$("#goat-league-page").popover({ trigger: "hover" });
$("#season-leaders-league-page").popover({ trigger: "hover" });
$("#rosters-league-page").popover({ trigger: "hover" });