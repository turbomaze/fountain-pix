Template.fountainPage.helpers({
    imageObj: function() {
        return FountainPictures.findOne(this.fountainObj.imageRef);
    },

    schoolName: function() {
        if (!this.schoolId) {
            return false;
        } else {
            var school = Schools.findOne(this.schoolId, {
                fields: {
                    name: 1
                }
            });
            return school ? school.name : false;
        }
    },

    schoolList: function() {
        if (!this.schoolId) {
            return Schools.find({}, {
                fields: {
                    _id: 1,
                    name: 1
                },
                sort: {name: 1}
            });
        } else {
            return false;
        }
    },

    alreadyRated: function() {
        var fountainId = Router.current().params._id;
        var rawFountains = localStorage.getItem('ratedFountains');
        var ratedFountains = rawFountains ? JSON.parse(rawFountains) : false;
        if (!ratedFountains) {
            ratedFountains = [];
            localStorage.setItem(
                'ratedFountains', JSON.stringify(ratedFountains)
            );
        }
        return ratedFountains.indexOf(fountainId) !== -1;
    },

    drinkPercent: function() {
        var fountainId = Router.current().params._id;
        var fountain = Fountains.findOne(fountainId);
        if (!fountain) return '0%';

        var wouldDrink = fountain.numDrinkable;
        var wouldntDrink = fountain.numNotDrinkable;
        var pct = wouldDrink/(wouldDrink+wouldntDrink);
        return (Math.floor(1000*pct)/10)+'%';
    },

    fmtRating: function() {
        var fountainId = Router.current().params._id;
        var fountain = Fountains.findOne(fountainId);
        if (!fountain) return '0/5, (0 ratings)';

        var fmtRating = (Math.round(100*fountain.rating)/20);
        fmtRating = (Math.round(10*fmtRating)/10)+'';
        if (fmtRating.length === 1) fmtRating += '.0';
        fmtRating += '/5';
        var numRatings = fountain.ratings.length;
        var s = numRatings === 1 ? '' : 's';
        return fmtRating+' ('+numRatings+' rating'+s+')';
    }
});

Template.fountainPage.events({
    'change #school-list': function(e, tmpl) {
        e.preventDefault();

        var schoolId = document.getElementById('school-list').value;
        if (schoolId === '_OTHER') {
            document.getElementById('other-school-cont')
                    .style.display = 'block';
        } else {
            document.getElementById('other-school-cont')
                    .style.display = 'none';
        }
    },

    'click #set-school-btn': function(e, tmpl) {
        e.preventDefault();

        var schoolId = document.getElementById('school-list').value;
        var fountainId = Router.current().params._id;
        if (schoolId === '_OTHER') {
            var name = document.getElementById('other-school-name');
                name = name.value;
            var population = document.getElementById('other-school-pop');
                population = population.value;
            var address = document.getElementById('other-school-addr');
                address = address.value;
            var schoolId = Schools.insert({
                name: name,
                population: parseInt(population),
                address: address,
                rating: 0,
                numRatings: 0,
                fountains: [fountainId]
            });
            Fountains.update(fountainId, {
                $set: {
                    schoolId: schoolId,
                    rating: 0,
                    ratings: [],
                    numDrinkable: 0,
                    numNotDrinkable: 0
                }
            });
        } else if (schoolId === '_EMPTY') {
            //do nothing
        } else {
            Schools.update(schoolId, {
                $addToSet: {
                    fountains: fountainId
                }
            });
            Fountains.update(fountainId, {
                $set: {
                    schoolId: schoolId,
                    rating: 0,
                    ratings: [],
                    numDrinkable: 0,
                    numNotDrinkable: 0
                }
            });
        }
    },

    'click #drink-yes': function(e, tmpl) {
        document.getElementById('drink-no').checked = false;
    },

    'click #drink-no': function(e, tmpl) {
        document.getElementById('drink-yes').checked = false;
    },

    'input #cleanliness-rating': function(e, tmpl) {
        var value = document.getElementById('cleanliness-rating').value;
        value = parseInt(value)/2;
        var adjectives = [
            [5, 'Vomit inducing'],
            [16, 'Disgusting'],
            [25, 'Below average'],
            [30, 'Average'],
            [35, 'Above average'],
            [44, 'Clean'],
            [50, 'Absolutely pristine']
        ];
        for (var ai = 0; ai < adjectives.length; ai++) {
            if (value < adjectives[ai][0]) {
                document.getElementById('clean-adj')
                        .innerHTML = adjectives[ai][1];
                break;
            }
        }
    },

    'click #rate-btn': function(e, tmpl) {
        e.preventDefault();

        var fountainId = Router.current().params._id;
        var cleanRating = document.getElementById('cleanliness-rating');
        cleanRating = parseInt(cleanRating.value)/100; //0 to 1
        var wouldDrink = !!document.getElementById('drink-yes').checked;
        var fountain = Fountains.findOne(fountainId);
        if (!!fountain) {
            var newRating = fountain.rating*fountain.ratings.length;
            newRating = (newRating + cleanRating)/(fountain.ratings.length+1);
            Fountains.update(fountainId, {
                $set: {
                    rating: newRating
                },
                $addToSet: {
                    ratings: [cleanRating, wouldDrink]
                },
                $inc: {
                    numDrinkable: wouldDrink ? 1 : 0,
                    numNotDrinkable: wouldDrink ? 0 : 1
                }
            });

            var school = Schools.findOne(fountain.schoolId);
            var newSchoolRating = school.rating*school.numRatings;
            newSchoolRating = (newSchoolRating+cleanRating)/(school.numRatings+1);
            Schools.update(fountain.schoolId, {
                $set: {
                    rating: newSchoolRating
                },
                $inc: {
                    numRatings: 1
                }
            });

            //weakly prevent them from rating again
            var rawFountains = localStorage.getItem('ratedFountains');
            var ratedFountains = rawFountains ? JSON.parse(rawFountains) : [];
            ratedFountains.push(fountainId)
            localStorage.setItem(
                'ratedFountains', JSON.stringify(ratedFountains)
            );
        }
    }
});