
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
                            newData.push({
                                id: item._id,  
                                market: item.market,
                                name: item.name,
                                team_id: item.team_id
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
    var render = '<p class="selected-team" data-team-id="'+ data.team_id + '"data-id="'+ data.id + '"> ' +data.market+ ' ' +data.name+'</p>';
    return render;
}

function formatNoMatches(data){
        var render = '<p>You drunk?</p>';
        return render;

}













