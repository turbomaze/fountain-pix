Meteor.publish('schools', function() {
    return Schools.find({});
});

Meteor.publish('fountain', function(fountainId) {
    check(fountainId, String);
    return Fountains.find({_id: fountainId});
});

Meteor.publish('fountainPictures', function() {
    return FountainPictures.find();
});