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
    }
});

Template.fountainPage.events({
    'change #school-list': function(e, tmpl) {
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
                    schoolId: schoolId
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
                    schoolId: schoolId
                }
            });
        }
    }
});