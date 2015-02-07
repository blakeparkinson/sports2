
// DOM Ready =============================================================
$(document).ready(function() {

    $("#select2").select2({
      width: "34%",
      placeholder: "Search a Team...",
      minimumInputLength: 2,
            ajax: {
                url: "teams/team",
                dataType: 'json', 
                    data: function(term, page) {
                        return {
                            q: term, //search term
                            page_limit: 10 // page size
                        };
                    },
                    results: function(data, page) {
                        var newData = [];
                        _.each(data, function (item) {
                            //soccer doesn't have a market
                            if (item.name == undefined){
                                item.name = '';
                            }
                            newData.push({
                                id: item._id,  
                                market: item.market,
                                name: item.name,
                                team_id: item.team_id,
                                league: item.league
                            });
                        });
                        return { results: newData };
                    }

                },
        formatResult: formatResult, //dropdown rendering of selectable options
        formatNoMatches: formatNoMatches,
        formatSelection: formatSelection, //final selected options


    });
 
    
});



// Functions ============================================================= //

function formatResult(data){

    var render = '<div id ="team-market">'+data.market+ ' ' +data.name+' </div>';

    return render
    }

function formatSelection(data){
    var render = '<p class="selected-team" data-league= "'+data.league+'" data-team-id="'+ data.team_id + '"data-id="'+ data.id + '"> ' +data.market+ ' ' +data.name+'</p>';
    return render;
}

function formatNoMatches(data){
        var render = '<p>You drunk?</p>';
        return render;

}

// Social Media ============================================================= //
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&appId=1600051886893474&version=v2.0";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));



!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';
if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';
fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');












