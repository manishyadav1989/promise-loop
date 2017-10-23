var fs = require('fs'),
    dataArray = [], 
    fileName = "logs/app_logs", 
    startFilePostFix = 0, 
    endFilePostFix = 5;
    
var promiseWhile = function(condition, action) {
    // init new promise defer object
    var resolver = Promise.defer();
    // start loop with anonymous function
    var loop = function() {
        // check condition. this will true when get false from condition function
        if (!condition()) return resolver.resolve();
        //
        return Promise.cast(action())
            .then(loop)
            .catch(resolver.reject);
    };
    // called same loop in next queue list
    process.nextTick(loop);
    // return when process completed
    return resolver.promise;
};

// check condition
var condition = function(){
    // return condition status with boolean value
    return (startFilePostFix < endFilePostFix);
}

// Performe action
var action = function(){
    var filePath = fileName + "" + startFilePostFix + ".log";
    // init new promise defer object
    var resolver = Promise.defer();
    
    if(fs.existsSync(filePath)){
        console.log("file exists")
        var stream = fs.createReadStream(filePath, 'UTF-8');
        var fsData = '';
        stream.once('data', function () {
          console.log('\n');
          console.log('Started Reading The Trex File');
        });

        stream.on('data', function (chunk) {
          fsData += chunk;
        });

        stream.on('end', function () {
           console.log(`Finished Reading The Trex File ${fsData.length}`);
           fsData = fsData.toString();
           fsData = fsData.replace(/@/g, '_');
           fsData = fsData.replace(/(?:\r\n|\r|\n)/g, ',');
           fsData = fsData.substr(0, fsData.length-1);
           fsData = "["+fsData+"]";
           fsData = JSON.parse(fsData);
           dataArray = dataArray.concat(fsData)
           return resolver.resolve();
        });
    }
    else{
        return resolver.resolve();
    }
    
    startFilePostFix++; // increase file post fix
    // return when process completed
    return resolver.promise;
}

promiseWhile(condition, action).then(function(){
    console.log("dataArray " + JSON.stringify(dataArray) )
    console.log('done process ');
});
