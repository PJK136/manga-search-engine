

/*
Manga Object's data scheme :
{
    titleEnglish: "str",    
    titleRomaji: "str",
    titleKanji: "str",
    imageURL: "url",                            (unsupported)
    description : "str",
    authors: ["str", "str", ...],
    demographics: ["str", "str", ...],
    genres: ["str", "str", ...],
    publishers: ["str", "str", ...],
    magazines : ["str", "str", ...],
    directors : ["str", "str", ...],            (new)
    producers : ["str", "str", ...],            (new)
    studios : ["str", "str", ...],              (new)
    firstPublicationDate: moment,
    lastPublicationDate: moment,
    numberOfVolumes: 45,
    numberOfChapters: 405,                      (unsupported)
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
    //! sanitize the string to remove some special characters like ō
    sanitizeName : function(string){
        return string.toLowerCase()
                     .replace(new RegExp('ā', 'g'), 'a')
                     .replace(new RegExp('ē', 'g'), 'e')
                     .replace(new RegExp('ī', 'g'), 'i')
                     .replace(new RegExp('ō', 'g'), 'o')
                     .replace(new RegExp('ū', 'g'), 'u');
    }
,
    //! sanitize the sparql variable
    sanitizeSPARQLName : function(string){
        return "replace(replace(replace(replace(replace(lcase("+string+"),'ā','a'),'ē','e'),'ī','i'),'ō','o'),'ū','u')";
    }
,
    //! get a json object which contains the result of a SPARQL query
    getSPARQLQueryResult : function(query, 
                                      source="https://dbpedia.org/sparql"){
        return new Promise(
            (resolve, reject) => {
                $.get(source, {"query": query, "format":"json"},  function(data) {
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

    //! get a Manga caracteristic which can have multiple values, like (caracteristcType) : authors, magazines, publishers, genres, demographics 
    //! returns a json array, each element of the array contains a label and an URI of one of the results
    //! example : { ["author_URI" : "the URI of the 1st author", "author_label": "name of the 1st author"],
    //              ["author_URI" : "the URI of the 2nd author", "author_label": "name of the 2nd author"] }
    getMangaCaracteristic(mangaURI, caracteristicType){
        return new Promise(
            (resolve, reject) => {
                // check if we manage the caracteristic
                if(!["author", "magazine", "publisher", "director", "producer", "studio", "demographic", "genre"].includes(caracteristicType)){
                    result = [];
                    resolve(result);
                } 

                var caracteristicURI = "?" + caracteristicType + "_URI";
                var caracteristicLabel = "?" + caracteristicType + "_label";
                var caracteristicPredicate = "";
                
                // choose the scheme of the search according to the chosen caracteristic
                if(["author", "magazine", "publisher"].includes(caracteristicType)) {
                    caracteristicPredicate = "dbo:" + caracteristicType;
                } else {
                    caracteristicPredicate = "dbp:" + caracteristicType;
                }
                
                //! select all the URIs of the chosen caracteristic & Manga, and if the URI has a label, add it to the result
                var query = "select distinct * where { "  + mangaURI +  " " + caracteristicPredicate + " " + caracteristicURI + ". "
                                            + " OPTIONAL{" + caracteristicURI + " rdfs:label " + caracteristicLabel + ". "
                                                        + "FILTER(!bound(" + caracteristicLabel + ") || lang(" + caracteristicLabel + ")='en')} "
                                            + " } ";
                
                //! execute the SPARQL query
                DBPedia.getSPARQLQueryResult(query).then(
                    result => {
                        for(var i=0; i<result.length; ++i){
                            //! if the URI has no label, we try to extract one
                            if(result[i][caracteristicType + "_label"] == undefined){
                                result[i][caracteristicType + "_label"] = DBPedia.getURILastFragment( result[i][caracteristicType + "_URI"] ).replace(new RegExp('_','g'),' ');
                            }
                        }
                        resolve(result);
                    }
                );
            }
        );
    }
,
    //! return a json object
    searchByURI: function(mangaURI){
        return new Promise(
            (resolve, reject) => {
                var query = "select * where { OPTIONAL{ " + mangaURI + " rdfs:label ?titleEnglish. }"
                                          + " OPTIONAL{ " + mangaURI + " dbp:jaRomaji ?titleRomaji. } " 
                                          + " OPTIONAL{ " + mangaURI + " dbp:jaKanji ?titleKanji. } "
                                          + " OPTIONAL{ " + mangaURI + " dbo:abstract ?description. } " 
                                          + " OPTIONAL{ " + mangaURI + " dbo:numberOfVolumes ?numberOfVolumes. } " 
                                          + " OPTIONAL{ " + mangaURI + " dbo:firstPublicationDate ?firstPublicationDate. } "
                                          + " OPTIONAL{ " + mangaURI + " dbp:last ?lastPublicationDate.} "
                                                                + " FILTER( (!bound(?description)  || lang(?description)  = 'en') " 
                                                                     + " && (!bound(?titleEnglish) || lang(?titleEnglish) = 'en') "
                                                                        + " )} LIMIT 1";
                DBPedia.getSPARQLQueryResult(query).then(
                    results => {
                        //! if no result
                        /*if (results.length <= 0){
                            reject(results);
                            return;
                        }*/

                        var manga = results[0];
                        var promises = [];

                        var caracteristics = ["author", "magazine", "publisher", "director", "producer", "studio", "demographic", "genre"];
                        caracteristics.forEach(function(car){
                            promises.push(DBPedia.getMangaCaracteristic(mangaURI, car).then(
                                subResult => {
                                    var values = [];
                                    for(var i=0; i<subResult.length; ++i){
                                        values.push(subResult[i][car + "_label"]);
                                    }
                                    if(values.length != 0)
                                        manga[car+"s"] = values;
                                }
                            ));
                        });
                        
                        if("firstPublicationDate" in manga)
                            manga["firstPublicationDate"] = moment(manga["firstPublicationDate"]);
                        if("lastPublicationDate" in manga)
                            manga["lastPublicationDate"] = moment(manga["lastPublicationDate"]);
                        manga["source"] = "DBPedia";
                        manga["sourceURL"] = mangaURI.slice(1,-1);
                        $.when.apply($, promises).then(function() {    
                            resolve(manga);
                        });
                    }
                );
            }
        );
    }
,
    //! return a json array
    searchByName: function(mangaName){
        return new Promise(
            (resolve, reject) => {
                var sanitizedName = DBPedia.sanitizeName(mangaName);
                var query = "select distinct ?manga where { "
                                                      + " ?manga rdf:type dbo:Manga; "
                                                              + " rdfs:label ?manga_label. "
                                                                + " FILTER(lang(?manga_label) = 'en'). "
                                                                + " BIND ( IF ( contains(lcase(str(?manga_label)),' (manga)'), strbefore(str(?manga_label), ' (manga)'), str(?manga_label)) as ?manga_name). "
                                                                + " FILTER (regex("+DBPedia.sanitizeSPARQLName("str(?manga_name)")+",'" + sanitizedName + "')). "
                                                     + " } ";
                
                DBPedia.getSPARQLQueryResult(query).then(
                    URIs => {
                        let promises = Array();
                        for(var i=0; i<URIs.length; ++i){
                            var mangaURI = "<" + URIs[i]["manga"] + ">";
                            promises.push( DBPedia.searchByURI( mangaURI ) );
                        }
                        $.when.apply($, promises).then(function() {
                            resolve(arguments);
                        });
                    }
                );
            }
        );
    }
,
    //! return a json array
    searchByAuthor: function(author){
        return new Promise(
            (resolve, reject) => {
                var sanitizedAuthor = DBPedia.sanitizeName(author);
                var query = "select distinct ?manga where {  ?author_uri rdfs:label ?author_label. "
                                                    + " ?manga dbo:author ?author_uri ."
                                                    + " ?manga rdf:type dbo:Manga. "
                                                    + " FILTER( regex("+DBPedia.sanitizeSPARQLName("str(?author_label)")+", '" + sanitizedAuthor + "' ) ). "
                                                    + " } ";
                
                DBPedia.getSPARQLQueryResult(query).then(
                    URIs => {
                        let promises = Array();
                        for(var i=0; i<URIs.length; ++i){
                            var mangaURI = "<" + URIs[i]["manga"] + ">";
                            promises.push( DBPedia.searchByURI( mangaURI ) );
                        }
                        $.when.apply($, promises).then(function() {
                            resolve(arguments);
                        });
                    }
                );
            }
        );
    }
,

// !!!!!!!!!!!! limité à 10 résultats pour faciliter le débuggage !!!!!!!!!!!!!!!!!
//            enlever la limite avant la version finale
    searchByGenre: function(genre){
        return new Promise(
            (resolve, reject) => {
                var sanitizedGenre = DBPedia.sanitizeName(genre);
                var query = "select distinct ?manga where { "
                                    + " { "
                                            + " ?manga dbp:genre ?genre. "
                                            + " ?manga rdf:type dbo:Manga. "
                                            + " ?genre rdfs:label ?genre_label. "
                                            + " FILTER( regex("+DBPedia.sanitizeSPARQLName("str(?genre_label)")+", '" +sanitizedGenre + "') ). "
                                    + " } "
                                    + " UNION "
                                    + " { "
                                            + " ?manga dbp:genre ?genre. "
                                            + " ?manga rdf:type dbo:Manga. "
                                            + " FILTER( regex("+DBPedia.sanitizeSPARQLName("str(?genre)")+", '" + sanitizedGenre + "') ). "
                                    + " } "
                            + " } LIMIT 9";
                
                DBPedia.getSPARQLQueryResult(query).then(
                    URIs => {
                        let promises = Array();
                        for(var i=0; i<URIs.length; ++i){
                            var mangaURI = "<" + URIs[i]["manga"] + ">";
                            promises.push( DBPedia.searchByURI( mangaURI ) );
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



//! Test procedure
$( document ).ready(function() {
    console.log( "ready!" );

    var mangaURI = "dbr:Fairy_Tail";
    var mangaName = "fAIry tAIl";
    var authorName = "EIICHIRO";
    var genre = "Fantasy";
    
    DBPedia.searchByGenre("aDVENT").then( // limiter à 10 résultats pour l'instant
        result => {
            console.log(result);
        }
    );
/*
    DBPedia.searchByName(mangaName).then(
        result => {
            console.log(result);
        }
    );
*/
});
    

    
/*

Notes pour moi-même (à supprimer avant la version finale)

todo list:
afficher une image
ajouter les propriétés manquantes
gérer le problème : pas de résultats
enlever la limite pour searchByGenre

*/


/*

presentation : 10min de pres
    worklflow : ce qui appelle quoi ... etc
    fonctionnalités : 
    démo:
rapport
    worklflow
    fonctionnalités
    capture d'écran
le code sera à rendre 

*/

