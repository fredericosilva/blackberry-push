"use strict";

var request  = require('request'),
    xml2js   = require('xml2js'),
    parser   = new xml2js.Parser( { explicitArray: false }),
    boundary = "650dhrasdfhHOITSfds7"
;

module.exports = function(url, appID, user, password) {

    var authInfo = new Buffer(user + ":" + password).toString('base64'),
        headers  = {
        'Content-Type'  : 'multipart/related; boundary=' + boundary + '; type=application/xml',
        'Authorization' : 'Basic ' + authInfo
    };

    return function(pin, message, callback) {
        var xml = buildXML(pin, message, appID);

        request.post({url: url, headers : headers, body : xml}, function(err, response, body) {
            if (err) {
                callback(err);
            } else if (response.statusCode === 200) {
                parseResponse(body, callback);
            } else {
                callback(response.statusCode);
            }
        });
    };
};

function parseResponse(data, callback) {
    parser.parseString(data, function(err, result) {
        if (err) {
            callback(err);
        } else {
            result = result.pap['push-response']['response-result'].$;
            callback(err, result);
        }
    });
}

function buildXML(pin, msg, appID) {

    if (typeof msg !== 'string') {
        msg = JSON.stringify(msg);
    }

    var deliverBefore = new Date(Date.now() + 2*3600*1000).toISOString().substring(0, 19) + 'Z',
        ID            = Date.now() + "" + Math.ceil(Math.random()* 10000);

    return [
        '--' + boundary,
        'Content-Type: application/xml; charset=utf-8',
        '',
        '<?xml version="1.0"?>',
        '<!DOCTYPE pap PUBLIC "-//WAPFORUM//DTD PAP 2.1//EN" "http://www.openmobilealliance.org/tech/DTD/pap_2.1.dtd">',
        '<pap>',
        '<push-message push-id="' + ID +
            '" deliver-before-timestamp="' + deliverBefore +
            '" source-reference="' + appID +
            '">',
        '<address address-value="' + pin + '"/>',
        '<quality-of-service delivery-method="unconfirmed"/>',
        '</push-message>',
        '</pap>',
        '--' + boundary,
        'Content-Type: text/plain',
        'Push-message-ID: ' + ID,
        '',
        msg,
        '--' + boundary + '--',
        ''
    ].join('\n');
}