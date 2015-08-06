/* FountainPictures
 * @property createdAt --- when this picture was added
 * @property schoolId --- the id of this picture's school
 * @property fountainId --- which fountain this is a picture of
 * @property secret --- generated on creation and never revealed; knowledge
 *                      of the secret is proof that a user uploaded an image
 */
FountainPictures = new FS.Collection('fountainPictures', {
    stores: [new FS.Store.GridFS('fountainPictures')]
});

Meteor.methods({
    isPictureCreator: function(fountainPicId, secret) {
        check(fountainPicId, String);
        check(secret, Match.Any);

        if (FountainPictures.find({
                _id: fountainPicId, secret: secret
            }).count() !== 0
        ) return true;

        return false;
    }
});