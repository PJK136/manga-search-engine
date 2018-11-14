

/*
Data Scheme    :
{
    titleRomaji: "str",
    titleKanji: "str",
    imageURL: "url",
    description : "str",
    authors: ["str", "str", ...],
    demographics: ["str", "str", ...],
    genres: ["str", "str", ...],
    publishers: ["str", "str", ...],
    magazines : ["str", "str", ...],
    firstPublicationDate: "str",
    lastPublicationDate: "str",
    numberOfVolumes: 45,
    numberOfChapters: 405,
    source: "DBPedia"
}
*/    



var DBPedia = {
    //! check if a string is a valid URL
    isValidURL : function(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;  
        }
    }
,
    //! get the last fragment of an URI
    getURILastFragment : function(uri){
        if (DBPedia.isValidURL(uri)){
            var parts = uri.split('/');
            return parts[parts.length-1];
        } else {
            return uri;
        }
    }
,
    //! get a json object which contains the result of a SPARQL request
    //let getSPARQLRequestResult = (query) => {
    getSPARQLRequestResult : function(query){
        return new Promise(
            (resolve, reject) => {
                $.get("https://dbpedia.org/sparql", {"query": query, "format":"json"},  function(data) {
                    let result = Array();
                    for(var i=0; i < data["results"]["bindings"].length; ++i){
                        var elem = Object();                
                        Object.keys(data["results"]["bindings"][i]).forEach(function(key) {
                            elem[key] = data["results"]["bindings"][i][key]["value"];
                        });
                        result.push(elem);
                    }
                    resolve(result);
                }).fail(error => {console.log(error);});
            }
        );
    }
,


    getAuthors(mangaURI){
        return new Promise(
            (resolve, reject) => {
                var query = "select * where { "  + mangaURI +  " dbo:author ?author } ";
                
                DBPedia.getSPARQLRequestResult(query).then(
                    result => {
                        for(var i=0; i<result.length; ++i){
                            Object.keys(result[i]).forEach(function(key) {
                                result[i][key] = DBPedia.getURILastFragment( result[i][key] );
                            });
                        }
                        resolve(result);
                    }
                );
            }
        );
    }
,    
    getMagazines(mangaURI){
        return new Promise(
            (resolve, reject) => {
                var query = "select * where { "  + mangaURI +  " dbo:magazine ?magazine } ";
                
                DBPedia.getSPARQLRequestResult(query).then(
                    result => {
                        for(var i=0; i<result.length; ++i){
                            Object.keys(result[i]).forEach(function(key) {
                                result[i][key] = DBPedia.getURILastFragment( result[i][key] );
                            });
                        }
                        resolve(result);
                    }
                );
            }
        );
    }
,    
    getPublishers(mangaURI){
        return new Promise(
            (resolve, reject) => {
                var query = "select * where { "  + mangaURI +  " dbo:publisher ?publisher } ";
                
                DBPedia.getSPARQLRequestResult(query).then(
                    result => {
                        for(var i=0; i<result.length; ++i){
                            Object.keys(result[i]).forEach(function(key) {
                                result[i][key] = DBPedia.getURILastFragment( result[i][key] );
                            });
                        }
                        resolve(result);
                    }
                );
            }
        );
    }
,    
    getDemographics(mangaURI){
        return new Promise(
            (resolve, reject) => {
                var query = "select * where { "  + mangaURI +  " dbp:demographic ?demographic } ";
                
                DBPedia.getSPARQLRequestResult(query).then(
                    result => {
                        for(var i=0; i<result.length; ++i){
                            Object.keys(result[i]).forEach(function(key) {
                                result[i][key] = DBPedia.getURILastFragment( result[i][key] );
                            });
                        }
                        resolve(result);
                    }
                );
            }
        );
    }
,    
    getGenres(mangaURI){
        return new Promise(
            (resolve, reject) => {
                var query = "select * where { "  + mangaURI +  " dbp:ge00nre ?genre } ";
                
                DBPedia.getSPARQLRequestResult(query).then(
                    result => {
                        for(var i=0; i<result.length; ++i){
                            Object.keys(result[i]).forEach(function(key) {
                                result[i][key] = DBPedia.getURILastFragment( result[i][key] );
                            });
                        }
                        resolve(result);
                    }
                );
            }
        );
    }
,

    getMangaSheet: function(mangaURI){
        return new Promise(
            (resolve, reject) => {
                var query = "select * where { "  + mangaURI +  " dbp:jaRomaji ?titleRomaji; " + 
                                                                "dbp:jaKanji ?titleKanji; " + 
                                                                "dbo:abstract ?description; " + 
                                                                "dbo:numberOfVolumes ?numberOfVolumes; " + 
                                                                "dbo:firstPublicationDate ?firstPublicationDate " +
                                                                "FILTER(lang(?description) = 'en')} LIMIT 1";
                
                DBPedia.getSPARQLRequestResult(query).then(
                    result => {
                        for(var i=0; i<result.length; ++i){
                            Object.keys(result[i]).forEach(function(key) {
                                result[i][key] = DBPedia.getURILastFragment( result[i][key] );
                            });
                        }
                        
                        DBPedia.getAuthors(mangaURI).then(
                            authorsResult => {
                                var authors = [];
                                for(var i=0; i<authorsResult.length; ++i){
                                    authors.push(authorsResult[i]['author']);
                                }
                                if(authors.length != 0)
                                    result[0]["authors"] = authors;
                            }
                        );
                        
                        DBPedia.getMagazines(mangaURI).then(
                            magazinesResult => {
                                var magazines = [];
                                for(var i=0; i<magazinesResult.length; ++i){
                                    magazines.push(magazinesResult[i]['magazine']);
                                }
                                if(magazines.length != 0)
                                    result[0]["magazines"] = magazines;
                            }
                        );
                        
                        DBPedia.getPublishers(mangaURI).then(
                            publishersResult => {
                                var publishers = [];
                                for(var i=0; i<publishersResult.length; ++i){
                                    publishers.push(publishersResult[i]['publisher']);
                                }
                                if(publishers.length != 0)
                                    result[0]["publishers"] = publishers;
                            }
                        );
                        
                        DBPedia.getDemographics(mangaURI).then(
                            demographicsResult => {
                                var demographics = [];
                                for(var i=0; i<demographicsResult.length; ++i){
                                    demographics.push(demographicsResult[i]['demographic']);
                                }
                                if(demographics.length != 0)
                                    result[0]["demographics"] = demographics;
                            }
                        );
                        
                        DBPedia.getGenres(mangaURI).then(
                            genresResult => {
                                var genres = [];
                                for(var i=0; i<genresResult.length; ++i){
                                    genres.push(genresResult[i]['genre']);
                                }
                                if(genres.length != 0)
                                    result[0]["genres"] = genres;
                            }
                        );
                        
                        
                        result[0]["source"] = "DBPedia";
                        resolve(result[0]);
                    }
                );
            }
        );
    }
,
    searchByName: function(mangaName){
        return new Promise(
            (resolve, reject) => {
                var query = "select distinct ?mangaURI where { " +
                                        "?mangaURI rdf:type dbo:Manga; " +
                                        "rdfs:label ?m. " + 
                                        "FILTER( IF ( contains ( lcase( str(?m)) , ' (manga)'), " +
                                        "lcase(strbefore( str(?m), ' (manga)')) = lcase(str('" + mangaName + "')), " +
                                        "lcase( str(?m)) = lcase(str('" + mangaName + "')))) " +
                                        "} ";
                
                DBPedia.getSPARQLRequestResult(query).then(
                    URIs => {
                        let promises = Array();
                        for(var i=0; i<URIs.length; ++i){
                            var mangaURI = "<" + URIs[i]["mangaURI"] + ">";
                            promises.push( DBPedia.getMangaSheet( mangaURI ) );
                        }
                        $.when.apply($, promises).then(function() {
                            resolve(arguments);
                        });
                    }
                );
            }
        );
    }

};


$( document ).ready(function() {
    console.log( "ready!" );

    var mangaURI = "dbr:Fairy_Tail";
    var mangaName = "Fairy Tail";


    DBPedia.searchByName(mangaName).then(
        result => {
            console.log(result);
        }
    );

});
    
    


// genre
// concaténer plusieurs résultatst
// problème de hunter x hunter

/*
presentation : 
    worklflow : ce qui appelle quoi ... etc
    fonctionnalités : 
    démo:
rapport
    worklflow
    fonctionnalités
    capture d'écran
le code sera à rendre 


*/
