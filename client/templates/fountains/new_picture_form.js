Template.newPictureForm.events({
    'click .add-picture-btn': function(e, tmpl) {
        e.preventDefault();

        var file = document.getElementsByClassName(
            'fountain-img-input'
        )[0].files[0];
        if (!!file) {
            var fountainId = tmpl.data._id;
            FountainPictures.insert(file, function(err, fileObj) {
                if (err) return Errors.throw(err.reason);

                var fountainPicId = fileObj._id;
                Meteor.call('addPicture', fountainId, fountainPicId,
                    function(err, result) {
                        if (err) return Errors.throw(err.reason);

                        if (result.badFountainId) {
                            return Errors.throw(
                                'You can only add pictures to valid fountains.'
                            );
                        } else if (result.badFountainPicId) {
                            return Errors.throw(
                                'Invalid fountain picture id.'
                            );
                        } else if (result.success) {
                            window.location.href = '/fountain/'+fountainId+'/'+result.success;
                        }
                    }
                );
            });
        }
    }
});