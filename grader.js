#!/usr/bin/env node

/*jshint node:true*/
/*global $:true */

/*
* Automatically grade files for the presence of specified HTML tags/attributes.
* Uses commander.js and cheerio. Teaches command line application development
* and basic DOM parsing.
*
* References:
*
*  + cheerio
*     - https://github.com/MatthewMueller/cheerio
*     - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
*     - http://maxogden.com/scraping-with-node.html
*
*  + commander.js
*     - https://github.com/visionmedia/commander.js
*     - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy
*
*  + JSON
*     - http://en.wikipedia.org/wiki/JSON
*     - https://developer.mozilla.org/en-US/docs/JSON
*     - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*                            
*/
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var htmlText;

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlUrl  = function(inUrl,checksfile,callback ) {
    console.log("Getting data from url...");
    var resp = rest.get(inUrl).on('complete', function(result,response){
        if (result instanceof Error){
            console.log("%s Url not accesible. Exiting.", inUrl);
            process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
        }else{
            $ = cheerio.load(result);
            var checks = loadChecks(checksfile).sort();
            var out = {};
            for(var ii in checks) {
                if (ii !== undefined){
                    var present = $(checks[ii]).length > 0;
                    out[checks[ii]] = present;
                }
            }

            var outJson = JSON.stringify(out, null, 4);
            callback(outJson);
        }
    });
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};


var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        if (ii !== undefined){
            var present = $(checks[ii]).length > 0;
            out[checks[ii]] = present;
        }
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main === module) {
    program
        .version('0.0.1')
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists),CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists),HTMLFILE_DEFAULT )
        .option('-u, --url <url>', 'Url to index.html')
        .parse(process.argv);

    //Check for files
    console.log("Testing file...");
    var checkJson1 = checkHtmlFile(program.file, program.checks);
    var outJson1 = JSON.stringify(checkJson1, null, 4);
    console.log(outJson1);
    //Check for urls
    if (program.url !== undefined){
        checkHtmlUrl(program.url, program.checks,function(outJson){
            if (outJson){
                console.log("coutJson: " + outJson);
            }
        });
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
