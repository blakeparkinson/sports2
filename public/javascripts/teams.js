
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
                            /*if (item.list_id){
                                item.name = item.list_name;
                            } */
                            newData.push({
                                id: item._id,  
                                market: item.market,
                                name: item.name,
                                team_id: item.team_id,
                                league: item.league,
                                list_id: item.list_id,
                                list_name: item.list_name,
                                description: item.description
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

    if (data.list_id){
        var render = '<div id ="team-market">'+data.description+' </div>';
    }
    else{

        var render = '<div id ="team-market">'+data.market+ ' ' +data.name+' </div>';
    }

    return render
    }

function formatSelection(data){
    console.log(data);
    if (data.list_id){
        var render = '<p class="selected-team"  data-league= "'+data.league+'" data-list-id="'+ data.list_id +'" data-list-name="'+ data.list_name + '"data-id="'+ data.id + '"> ' +data.description+'</p>';
    }

    else{
        var render = '<p class="selected-team" data-team="'+data.market+ ' ' +data.name+'" data-league= "'+data.league+'" data-team-id="'+ data.team_id + '"data-id="'+ data.id + '"> ' +data.market+ ' ' +data.name+'</p>';
    }
    return render;
}

function formatNoMatches(data){
        var render = '<p>You drunk?</p>';
        return render;

}













