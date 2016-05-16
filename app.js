var http = require('http');
var httpreq = require('httpreq');

function downloadVideos(json) {
    var i = 0;
    while (i < json.length) {
        var location = json[i];
        var assets = location.assets;
        var j = 0;

        while (j < assets.length) {
            var asset = assets[j];

            httpreq.download(asset.url, asset.id + ".mov", function (err, progress) {
                if (err) {
                    return console.log(err);
                }
                console.log(progress);
            }, function (err, res) {
                if (err) {
                    return console.log(err);
                }
                console.log(res);
            });

            j++;
        }

        i++;
    }
}

var feed = "http://a1.phobos.apple.com/us/r1000/000/Features/atv/AutumnResources/videos/entries.json?&jsonace=786#raw-json";
http.get(feed, function(res){
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        var json = JSON.parse(body);
        console.log(json);
        downloadVideos(json);
    });
}).on('error', function(e){
    console.log("Got an error: ", e);
});
