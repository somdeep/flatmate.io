var request = require('request');
var parser = require('xml2json');
var cheerio = require('cheerio');

var getRooms = function (city,min,max,callback){

  request("https://geo.craigslist.org/iso/us", function(err,response,body){
    var $ = cheerio.load(body);
    var addrs = [];
    var rooms = [];

    $("li","#list").each(function(){
      var link = $(this);
      var text = link.text();
      var start = link.toString().indexOf('//') + 2;
      var end = link.toString().indexOf(".craigslist.org");
      var addr = link.toString().substring(start, end);
      if (text.toLowerCase().indexOf(city.toLowerCase()) > -1){
        //console.log(city + " found as: " + text + " -> " + addr);
        addrs.push(addr);
      }
    });

    if (addrs.length == 1) { //if there is no ambiguity
      // form the query url
      var url = "https://"+addrs[0]+".craigslist.org/search/aap?"
              +"format=rss&hasPic=1&search_distance_type=mi"
              +"&min_price"+min+"&max_price="+max;
      //console.log(url);

      request(url, function(err,response,body){

        if (!err && response.statusCode == 200){
          //convert xml to json format
          var str = parser.toJson(body);
          // var pretty = JSON.stringify(eval("(" + str + ")"), null, 4);
          // console.log(pretty);
          var json = JSON.parse(str);
          //list of all rooms given by craigslist
          var list = json["rdf:RDF"]["item"];

          //loop to get the first n rooms
          var i;
          var max = Math.min(list.length, 3);
          for (i = 0; i<max; i++){
            //reformat json instead of passing raw data directly
            var room = {
                        'title': list[i]['title'],
                        'description': list[i]['description'],
                        'date': list[i]['dc:date'],
                        'link': list[i]['link'],
                        'picLink': list[i]['enc:enclosure']['resource']
                        };
            rooms.push(room);
          }
          callback(null,rooms);

        }
        else {
          callback(err);
        }
      }); //end of second request (for rooms)
    }
    else { // if we can't find the city name on craigslist, or there is ambiguity
      callback(null,rooms);
    }
  }); //end of first request (for available cities)

} //end of getRooms()

module.exports = getRooms;
