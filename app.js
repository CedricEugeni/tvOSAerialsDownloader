var http = require('http');
var promise = require('bluebird');
var url = require('url');
var fs = require('fs');
var assert = require('assert');

function download(option) {
    assert(option);
    if (typeof option == 'string') {
        option = url.parse(option);
    }

    return new promise(function(resolve, reject) {
        var req = http.request(option, function(res) {
            if (res.statusCode == 200) {
                resolve(res);
            } else {
                if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
                    resolve(download(res.headers.location));
                } else {
                    reject(res.statusCode);
                }
            }
        })
        .on('error', function(e) {
            reject(e);
        })
        .end();
    });
}

function downloadVideos(json) {
    var i = 0;
    while (i < json.length) {
        var location = json[i];
        var assets = location.assets;
        var j = 0;

        while (j < assets.length) {
            var asset = assets[j];

            download(asset.url).then(function(stream) {
                try {
                    var writeStream = fs.createWriteStream(asset.id + ".mov");
                    stream.pipe(writeStream);
                } catch(e) {
                    console.error(e);
                }
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
