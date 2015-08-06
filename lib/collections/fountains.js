/* Fountains
 * @property _id --- id of this water fountain
 * @property schoolId --- the id of the school this fountain is at
 * @property schoolName --- the name of the school this fountain is at
 * @property rating --- average rating of this fountain
 * @property numRatings --- total number of ratings
 * @property numDrinkable --- number of people who would drink from it
 * @property numNotDrinkable --- number of people who wouldn't
 * @property updatedAt --- the last time an image of this fountain was added
 * @property images --- object of image infos of this form:
 *                      {
 *                          fountainPictureId: {
 *                              createdAt: datePictureTaken,
 *                              rating: averageRatingForImage,
 *                              numRatings: numRatingsForImage,
 *                              numDrinkable: numDrinkable,
 *                              numNotDrinkable: numNotDrinkable
 *                          }
 *                      }
 *
 */
Fountains = new Meteor.Collection('fountains');

Meteor.methods({
    addFountain: function(schoolId, fountainPicId) {
        check(schoolId, String);
        check(fountainPicId, String);

        //check that the school exists
        var school = Schools.find(schoolId);
        if (school.count() === 0) {
            return {
                badSchoolId: true
            };
        }
        school = school.fetch()[0];

        //check that the fountain picture exists
        if (FountainPictures.find(fountainPicId).count() === 0) {
            return {
                badFountainPicId: true
            };
        }

        //all good, add the fountain!
        var createdAt = new Date();
        var imagesObj = {};
        imagesObj[fountainPicId] = {
            createdAt: createdAt,
            rating: 0, numRatings: 0,
            numDrinkable: 0, numNotDrinkable: 0
        };
        var fountainId = Fountains.insert({
            schoolId: schoolId,
            schoolName: school.name,
            rating: 0, numRatings: 0,
            numDrinkable: 0, numNotDrinkable: 0,
            updatedAt: createdAt,
            images: imagesObj
        });

        //attach the creation time and other misc info to the picture doc
        var secret = Random.id();
        FountainPictures.update(fountainPicId, {
            $set: {
                createdAt: createdAt,
                schoolId: schoolId,
                fountainId: fountainId,
                secret: secret
            }
        });

        //link this fountain to its school
        school.fountains[fountainId] = {
            imageRef: fountainPicId,
            rating: 0, numRatings: 0,
            numDrinkable: 0, numNotDrinkable: 0,
            updatedAt: createdAt,
            numPics: 1
        };
        Schools.update(schoolId, {$set: {fountains: school.fountains}});

        return {
            success: fountainId,
            secret: secret
        };
    },

    addPicture: function(fountainId, fountainPicId) {
        check(fountainId, String);
        check(fountainPicId, String);

        //check that the fountain exists
        if (Fountains.find(fountainId).count() === 0) {
            return {
                badFountainId: true
            };
        }

        //check that the fountain picture exists
        if (FountainPictures.find(fountainPicId).count() === 0) {
            return {
                badFountainPicId: true
            };
        }

        //add the picture to the fountain
        var createdAt = new Date();
        var fountain = Fountains.findOne(fountainId);
        fountain.images[fountainPicId] = {
            createdAt: createdAt,
            rating: 0, numRatings: 0,
            numDrinkable: 0, numNotDrinkable: 0
        };
        Fountains.update(fountainId, {
            $set: {
                updatedAt: createdAt,
                images: fountain.images
            }
        });

        //attach the creation time and other info to the picture document
        var secret = Random.id();
        FountainPictures.update(fountainPicId, {
            $set: {
                createdAt: createdAt,
                schoolId: fountain.schoolId,
                fountainId: fountainId,
                secret: secret
            }
        });

        //update the school doc
        var school = Schools.findOne(fountain.schoolId);
        if (!school) {
            school = {};
            school.fountains = {};
            school.fountains[fountainId] = {};
        }
        school.fountains[fountainId].imageRef = fountainPicId;
        school.fountains[fountainId].updatedAt = createdAt;
        school.fountains[fountainId].numPics = Object.keys(
            fountain.images
        ).length;
        Schools.update(fountain.schoolId, {
            $set: {fountains: school.fountains}
        });

        return {
            success: Object.keys(fountain.images).length-1,
            secret: secret
        };
    },

    rateFountain: function(fountainId, fountainPicId, rating, wouldDrink) {
        check(fountainId, String);
        check(fountainPicId, String);
        check(rating, Number);
        check(wouldDrink, Boolean);

        //make sure the fountain exists
        var fountain = Fountains.find(fountainId);
        if (fountain.count() === 0) {
            return {
                badFountainId: true
            };
        }
        fountain = fountain.fetch()[0];

        //make sure the fountain picture exists
        if (FountainPictures.find(fountainPicId).count() === 0) {
            return {
                badFountainPictureId: true
            };
        }

        //ratings must be between zero and one
        if (rating < 0 || rating > 1) {
            return {
                badRating: true
            };
        }

        //wouldDrink needs to be boolean
        if (wouldDrink !== false && wouldDrink !== true) {
            return {
                wouldDrinkNotBool: true
            };
        }

        //get the update obj for the fountain picture normalization
        var picObj = fountain.images[fountainPicId];
        var newRating = rating + picObj.rating*picObj.numRatings;
        newRating /= picObj.numRatings + 1;
        picObj.rating = newRating;
        picObj.numRatings += 1;
        picObj.numDrinkable += wouldDrink ? 1 : 0;
        picObj.numNotDrinkable += wouldDrink ? 0 : 1;

        //update the weighted average for the fountain
        var newFRating = rating + fountain.rating*fountain.numRatings;
        newFRating /= fountain.numRatings + 1;
        fountain.rating = newFRating;
        fountain.numRatings += 1;
        fountain.numDrinkable += wouldDrink ? 1 : 0;
        fountain.numNotDrinkable += wouldDrink ? 0 : 1;

        //get the update object for the fountain
        var updateObj = {
            rating: fountain.rating,
            numRatings: fountain.numRatings,
            numDrinkable: fountain.numDrinkable,
            numNotDrinkable: fountain.numNotDrinkable
        };
        updateObj['images.'+fountainPicId] = picObj;
        Fountains.update(fountainId, {$set: updateObj});

        //update the weighted average for the school
        var school = Schools.findOne(fountain.schoolId);
        if (!school) {
            school = {rating: 0, numRatings: 0, fountains: {}};
            school.fountains[fountainId] = {};
        }
        var newSRating = rating + school.rating*school.numRatings;
        newSRating /= school.numRatings + 1;
        school.numRatings += 1;
        school.fountains[fountainId].rating = fountain.rating;
        school.fountains[fountainId].numRatings = fountain.numRatings;
        school.fountains[fountainId].numDrinkable += wouldDrink ? 1 : 0;
        school.fountains[fountainId].numNotDrinkable += wouldDrink ? 0 : 1;
        Schools.update(fountain.schoolId, {
            $set: {
                rating: newSRating,
                numRatings: school.numRatings,
                fountains: school.fountains
            }
        });

        return {
            success: true
        };
    },

    deletePicture: function(fountainPicId, secret) {
        check(fountainPicId, String);
        check(secret, Match.Any);

        //make sure the fountain picture exists
        var fp = FountainPictures.find(fountainPicId);
        if (fp.count() === 0) {
            return {
                badFountainPictureId: true
            };
        }
        fp = fp.fetch()[0];

        //make sure the secret is correct
        var hash = CryptoJS.MD5(secret).toString();
        var count = FountainPictures.find({
            _id: fountainPicId, secret: secret
        }).count();
        if (count === 0 && hash !== Meteor.settings.public.masterSecret) {
            return {
                badSecret: true
            };
        }

        //delete the fountain picture
        FountainPictures.remove(fountainPicId);

        //update the fountain's ratings
        var fountain = Fountains.findOne(fp.fountainId);
        if (!fountain) {
            fountain = {
                rating: 0, numRatings: 0,
                numDrinkable: 0, numNotDrinkable: 0,
                images: {}
            };
        }
        var fpData = fountain.images[fountainPicId];
        if (!fpData) fpData = {};
        var newFRating = fountain.rating*fountain.numRatings;
        newFRating -= fpData.rating*fpData.numRatings;
        var fDenom = fountain.numRatings - fpData.numRatings;
        newFRating = fDenom === 0 ? 0 : newFRating/fDenom;
        fountain.rating = newFRating;
        fountain.numRatings -= fpData.numRatings;
        fountain.numDrinkable -= fpData.numDrinkable;
        fountain.numNotDrinkable -= fpData.numNotDrinkable;
        var idx = Object.keys(fountain.images).indexOf(fountainPicId);
        delete fountain.images[fountainPicId];

        //delete the fountain
        var deletedFountain = false;
        if (Object.keys(fountain.images).length === 0) {
            Fountains.remove(fp.fountainId);
            deletedFountain = true;
        } else {
            Fountains.update(fp.fountainId, {
                $set: {
                    rating: fountain.rating, numRatings: fountain.numRatings,
                    numDrinkable: fountain.numDrinkable,
                    numNotDrinkable: fountain.numNotDrinkable,
                    images: fountain.images
                }
            });
        }

        //update the school's ratings
        var school = Schools.findOne(fp.schoolId);
        if (!school) {
            school = {fountains: {}};
        }
        var newSRating = school.rating*school.numRatings;
        newSRating -= fpData.rating*fpData.numRatings;
        var sDenom= school.numRatings - fpData.numRatings;
        newSRating = sDenom === 0 ? 0 : newSRating/sDenom;
        school.rating = newSRating;
        school.numRatings -= fpData.numRatings;

        //see if removing this pic will remove the fountain
        if (!school.fountains[fp.fountainId]) {
            school.fountains[fp.fountainId] = {};
        }
        if (school.fountains[fp.fountainId].numPics === 1) {
            delete school.fountains[fp.fountainId];
            //no more fountains?
            if (Object.keys(school.fountains).length === 0) {
                school.rating = 0; //compensate for rounding errors
            }
        } else {
            //the denormalized fountain is here to stick around so keep it
            var nextMostRecentPic = FountainPictures.find({
                fountainId: fp.fountainId
            }, {
                $sort: {createdAt: 1},
                $limit: 1
            }).fetch()[0] || {};
            var sFountain = school.fountains[fp.fountainId];
            sFountain.rating = fountain.rating;
            sFountain.numRatings = fountain.numRatings;
            sFountain.numDrinkable = fountain.numDrinkable;
            sFountain.numNotDrinkable = fountain.numNotDrinkable;
            sFountain.imageRef = nextMostRecentPic._id;
            sFountain.updatedAt = nextMostRecentPic.createdAt;
            sFountain.numPics -= 1;
        }

        //update the school
        Schools.update(fp.schoolId, {
            $set: {
                rating: school.rating,
                numRatings: school.numRatings,
                fountains: school.fountains
            }
        });

        //all good, delete the picture
        return {
            success: true,
            deletedFountain: deletedFountain ? fp.schoolId : false,
            idxOfPrev: Math.max(idx-1, 0)
        };
    }
});