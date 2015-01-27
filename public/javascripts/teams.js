
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
                                id: item.id,  
                                market: item.market,
                                name: item.name
                            });
                        });
                        return { results: newData };
                    }

                },
        formatResult: formatResult, //dropdown rendering of selectable options
        formatNoMatches: formatNoMatches,
        formatSelection: formatSelection, //final selected options


    });
 

    $("#selectP").select2({
      width: "34%",
      placeholder: "Search a Player...",
      minimumInputLength: 2,
            ajax: {
                url: "teams/players",
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
                                id: item.id,  
                                full_name: item.full_name,
                                last_name: item.last_name
                            });
                        });
                        return { results: newData };
                    }

                },
        formatResultP: formatResultP, //dropdown rendering of selectable options
        formatNoMatchesP: formatNoMatchesP,
        formatSelectionP: formatSelectionP, //final selected options


    });




    
});

// Team Functions ============================================================= //

function formatResult(data){
    console.log(data);

    var render = '<div id ="team-market">'+data.market+ ' ' +data.name+' </div>';

    return render
    }

function formatSelection(data){
    var render = '<p class="selected-team id="' + data.id + '"> ' +data.market+ ' ' +data.name+'</p>';
    return render;
}

function formatNoMatches(data){
        var render = '<p>You drunk?</p>';
        return render;

}

// Player Functions ============================================================= //

function formatResultP(data){
    console.log(data);

    var render = '<div id ="player-full_name">'+data.full_name+' </div>';

    return render;
    }

function formatSelectionP(data){
    var render = '<p class="selected-player id="' + data.id + '"> ' +data.full_name+ ' ' +data.last_name+'</p>';
    return render;
}

function formatNoMatchesP(data){
        var render = '<p>Get outta here</p>';
        return render;
}










