
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading'
});

Router.route('/', {
    name: 'home',
    template: 'schoolsList',
    data: function() {
        var schools = Schools.find({}).fetch();
        schools.map(function(school) {
            var fmtRating = (Math.round(10*school.rating)/2)+'/5';
            school.fmtRating = fmtRating;
            school.fmtNumRatings = school.numRatings+' rating';
            if (school.numRatings !== 1) {
                school.fmtNumRatings += 's';
            }
        });

        return {
            schools: schools
        };
    }
});