function searchMALByName(name, onSuccess)
{
    $.get("https://api.jikan.moe/v3/search/manga",
          {"q":name, "type":"manga", "page":1},
          function(results) {
        var mangasData = [];
        var promises = [];
        for (var i in results["results"])
        {
            var summary = results["results"][i];
            var request = $.get("https://api.jikan.moe/v3/manga/"+summary["mal_id"],function(manga) {
                var data = {
                    "imageURL": manga["image_url"],
                    "title": manga["title"],
                    "firstPublicationDate": manga["start_date"],
                    "lastPublicationDate": manga["end_date"],
                    "volumes": manga["volumes"]
                };
                
                //console.log(data);
                mangasData.push(data);
            });
            
            promises.push(request);
        }
        
        $.when.apply(null, promises).done(function() {
            getResults(mangasData);
        });
    });
}
