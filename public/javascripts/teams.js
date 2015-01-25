
// DOM Ready =============================================================
$(document).ready(function() {

    $(".select2").select2({
      width: "34%",
      minimumInputLength: 2,
      //dropdownCssClass: "standards-dropdown",
            //containerCssClass: "standards-container",
  

            //fixedSearchResultLabel: true, // dom element that is always visible after search
            //fixedSearchResultMarkup: "<li id='browseStandards'>Browse All Standards</li>", // dom element that is always visible after search

            ajax: {
                url: "teams/team",
                data: function (term, page) {

                    return {
                        q                   : term, // search term
                        page_limit          : 10
                    };
                },
                results: function (data, page) { // parse the results into the format expected by Select2.
                    // since we are using custom formatting functions we do not need to alter remote JSON data
                    return {results: data};

                }
            },
            //formatResult: formatResult, //dropdown rendering of selectable options
            //formatNoMatches: formatNoMatches,
            //formatSelection: formatSelection, //final selected options
    });
 
    
});

// Functions ============================================================= //













