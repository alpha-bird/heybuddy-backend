const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _AnonymousTip = require('../models/anonymoustip'),
      _Chat = require('../models/chat'),
      _Company = require('../models/company'),
      _Incident = require('../models/incident'),
      _Meetup = require('../models/meetup'),
      _NewsFeed = require('../models/newsfeed'),
      _User = require('../models/user');

const searchModule = {
    searchAll : wrapper(function*( req, res ) {
        var searchString = req.body.content;
        var anonymousTips = yield _AnonymousTip.search(searchString);
        var chats = yield _Chat.search(searchString);
        var compaies = yield _Company.search(searchString);
        var incidents = yield _Incident.search(searchString);
        var meetups = yield _Meetup.search(searchString);
        var newsfeeds = yield _NewsFeed.search(searchString);
        var users = yield _User.search(searchString);

        res.send({ success : true, result : {
            anonymousTips : anonymousTips,
            chats : chats,
            companies : compaies,
            incidents : incidents,
            meetups : meetups,
            newsfeeds : newsfeeds,
            users : users
        }})
    })
}

module.exports = searchModule;