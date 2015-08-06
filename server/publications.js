Meteor.publish('school', function(schoolId) {
    check(schoolId, String);
    return [
        Schools.find(schoolId, {
            fields: {secret: 0}
        }),
        FountainPictures.find({schoolId: schoolId}, {
            fields: {secret: 0}
        })
    ];
});

Meteor.publish('schools', function() {
    return Schools.find({}, {
        fields: {secret: 0}
    });
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
            fields: {secret: 0}
        })
    ];
});