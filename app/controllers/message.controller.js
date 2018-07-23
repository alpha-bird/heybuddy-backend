const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      AWS = require('aws-sdk'),
      S3 = new AWS.S3(),

const messageModule = {
    uploadMedia : wrapper(function*(req, res) {
        var message_media_bucket = 'message-media';
        var key = utilies.getBlobNameWillUpload() + `.${req.body.filetype}`;
        var data = req.body.content;
        var params = { 
            Bucket: message_media_bucket, 
            Key: key, 
            Body: data,
            ACL : 'public-read'
        };
        var upload = ( params ) => {
            return new Promise((resolve, reject) => {
                S3.putObject(params, (err, data) => {
                    if(err) reject(err)
                    else resolve(data)
                })
            })
        }

        var status = yield upload(params)
        var url = `https://s3.amazonaws.com/${message_media_bucket}/${key}`
        res.send({ success : true, data : status, url : url })
    })
}

module.exports = messageModule;