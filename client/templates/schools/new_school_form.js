Template.newSchoolForm.events({
    'click #add-school-btn': function(e, tmpl) {
        e.preventDefault();

        var name = document.getElementById('other-school-name').value;
        var pop = document.getElementById('other-school-pop').value;
        pop = parseInt(pop);
        var addr = document.getElementById('other-school-addr').value;

        Meteor.call('addSchool', name, pop, addr, function(err, result) {
            if (err) return Errors.throw(err.reason);

            if (result.badNameLength) {
                return Errors.throw(
                    'School names must be between 3 and 50 characters.'
                );
            } else if (result.badPop) {
                return Errors.throw(
                    'School populations must be between 5 and 40,000.'
                );
            } else if (result.badAddrLength) {
                return Errors.throw(
                    'School addresses must be between 10 and 80 characters.'
                );
            } else if (result.schoolAlreadyAdded) {
                Router.go('schoolPage', {_id: result.schoolAlreadyAdded});
            }else if (result.success) {
                Router.go('schoolPage', {_id: result.success});
            }
        });
    }
});