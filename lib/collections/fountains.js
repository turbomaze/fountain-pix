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
 *                              numNotDrinkable: numNotDrinkable,
 *                              ratings: array of [rating, isDrinkable]
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
            numDrinkable: 0, numNotDrinkable: 0,
            ratings: []
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
        FountainPictures.update(fountainPicId, {
            $set: {
                createdAt: createdAt,
                schoolId: schoolId,
                fountainId: fountainId
            }
        });

        //link this fountain to its school
        school.fountains[fountainId] = {
            imageRef: fountainPicId,
            rating: 0, numRatings: 0,
            updatedAt: createdAt,
            numPics: 1
        };
        Schools.update(schoolId, {$set: {fountains: school.fountains}});

        return {
            success: fountainId
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
            numDrinkable: 0, numNotDrinkable: 0,
            ratings: []
        };
        Fountains.update(fountainId, {
            $set: {
                updatedAt: createdAt,
                images: fountain.images
            }
        });

        //attach the creation time and other info to the picture document
        FountainPictures.update(fountainPicId, {
            $set: {
                createdAt: createdAt,
                schoolId: fountain.schoolId,
                fountainId: fountainId
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
        school.fountains[fountainId].numPics = Object.keys(fountain.images).length;
        Schools.update(fountain.schoolId, {
            $set: {fountains: school.fountains}
        });

        return {
            success: Object.keys(fountain.images).length-1
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
        picObj.ratings.push([]);

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
        Schools.update(fountain.schoolId, {
            $set:{
                rating: newSRating,
                numRatings: school.numRatings,
                fountains: school.fountains
            }
        });

        return {
            success: true
        };
    }
});