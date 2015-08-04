Meteor.publish('school', function(schoolId) {
    check(schoolId, String);
    return Schools.find({_id: schoolId});
});

Meteor.publish('schools', function() {
    return Schools.find({});
});

Meteor.publish('fountain', function(fountainId) {
    check(fountainId, String);
    return Fountains.find({_id: fountainId});
});

Meteor.publish('fountains', function() {
    return Fountains.find({});
});

Meteor.publish('fountainPictures', function() {
    return FountainPictures.find({});
});