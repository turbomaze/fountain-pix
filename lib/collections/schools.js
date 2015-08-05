/* Schools
 * @property _id --- id of this school
 * @property name --- the name of the school
 * @property population --- how many people go to this school
 * @property address --- where the school is located
 * @property rating --- average rating of this school's fountains
 * @property numRatings --- how many ratings
 * @property fountains --- object of fountain infos of this form:
 *                         {
 *                             fountainId: {
 *                                 imageRef: fountainPictureId,
 *                                 rating: averageRating,
 *                                 numRatings: totalNumRatings,
 *                                 updatedAt: dateThisImageWasTaken,
 *                                 numPics: numPicsOfThisFountain
 *                             }
 *                         }
 *
 */
Schools = new Meteor.Collection('schools');

Meteor.methods({
    addSchool: function(name, pop, addr) {
        check(name, String);
        check(pop, Number);
        check(addr, String);

        //make sure the name is a good size
        if (name.length < 3 || name.length > 50) {
            return {
                badNameLength: true
            };
        }

        //population must be reasonable
        pop = pop || 0;
        if (pop < 5 || pop > 40000) {
            return {
                badPop: true
            };
        }

        //address should be a good size
        if (addr.length < 10 || addr.length > 80) {
            return {
                badAddrLength: true
            };
        }

        //no duplicates!
        var sameNamedSchools = Schools.find({name: name});
        if (sameNamedSchools.count() !== 0) {
            return {
                schoolAlreadyAdded: sameNamedSchools.fetch()[0]._id
            };
        }

        //all good, so insert
        var schoolId = Schools.insert({
            name: name,
            population: pop,
            address: addr,
            rating: 0,
            numRatings: 0,
            fountains: {}
        });
        return {
            success: schoolId
        };
    }
});