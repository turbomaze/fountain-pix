Meteor.publish('school', function(schoolId) {
    check(schoolId, String);
    return [
        Schools.find(schoolId),
        FountainPictures.find({schoolId: schoolId})
    ];
});

Meteor.publish('schools', function() {
    return Schools.find({});
});

Meteor.publish('fountain', function(fountainId) {
    check(fountainId, String);
    return [
        Fountains.find(fountainId),
        FountainPictures.find({fountainId: fountainId})
    ];
});
