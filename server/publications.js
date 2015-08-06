Meteor.publish('school', function(schoolId) {
    check(schoolId, String);
    return [
        Schools.find(schoolId),
        FountainPictures.find({schoolId: schoolId}, {
            fields: {secret: 0}
        })
    ];
});

Meteor.publish('schools', function() {
    return Schools.find({});
});

Meteor.publish('fountain', function(fountainId) {
    check(fountainId, String);
    return [
        Fountains.find(fountainId),
        FountainPictures.find({fountainId: fountainId}, {
            fields: {secret: 0}
        })
    ];
});

Meteor.publish('fountainPicture', function(fountainPicId) {
    check(fountainPicId, String);
    return [
        FountainPictures.find(fountainPicId, {
            fields: {secret: false}
        }) //only way to get it to work unfortunately
    ];
});