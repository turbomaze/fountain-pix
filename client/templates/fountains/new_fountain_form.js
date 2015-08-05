Template.newFountainForm.events({
    'click .add-fountain-btn': function(e, tmpl) {
        e.preventDefault();

        var file = document.getElementsByClassName(
            'fountain-img-input'
        )[0].files[0];
        if (!!file) {
            FountainPictures.insert(file, function(err, fileObj) {
                if (err) return Errors.throw(err.reason);

                var schoolId = Router.current().params._id;
                var fountainPicId = fileObj._id;
                Meteor.call('addFountain', schoolId, fountainPicId,
                    function(err, result) {
                        if (err) return Errors.throw(err.reason);

                        if (result.badSchoolId) {
                            return Errors.throw(
                                'You can only add fountains to valid schools.'
                            );
                        } else if (result.badFountainPicId) {
                            return Errors.throw(
                                'Invalid fountain picture id.'
                            );
                        } else if (result.success) {
                            Router.go('fountainPage', {_id: result.success});
                        }
                    }
                );
            });
        }
    }
});