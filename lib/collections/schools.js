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
 *                                 numDrinkable: numWouldDrink,
 *                                 numNotDrinkable: numWouldNotDrink,
 *                                 updatedAt: dateThisImageWasTaken,
 *                                 numPics: numPicsOfThisFountain
 *                             }
 *                         }
 * @property secret --- generated on creation and never revealed; knowledge
 *                      of the secret is proof that a user made the school
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
        var secret = Random.id();
        var schoolId = Schools.insert({
            name: name,
            population: pop,
            address: addr,
            rating: 0,
            numRatings: 0,
            fountains: {},
            secret: secret
        });
        return {
            success: schoolId,
            secret: secret
        };
    },

    isSchoolCreator: function(schoolId, secret) {
        check(schoolId, String);
        check(secret, Match.Any);

        if (Schools.find({
                _id: schoolId, secret: secret
            }).count() !== 0
        ) return true;

        return false;
    },

    deleteSchool: function(schoolId, secret) {
        check(schoolId, String);
        check(secret, Match.Any);

        //the school has to actually exist
        var school = Schools.find(schoolId);
        if (school.count() === 0) {
            return {
                badSchoolId: true
            };
        }
        school = school.fetch()[0];

        //they need to know the secret to delete this school
        if (Schools.find({_id: schoolId, secret: secret}).count() === 0) {
            return {
                badSecret: true
            };
        }

        //the school can't have any fountains associated with it
        if (Object.keys(school.fountains).length !== 0) {
            return {
                stillHasFountains: true
            };
        }

        //delete the school
        Schools.remove(schoolId);

        return {
            success: true
        };
    }
});