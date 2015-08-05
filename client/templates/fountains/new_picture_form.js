Template.newPictureForm.events({
    'click .add-picture-btn': function(e, tmpl) {
        e.preventDefault();

        var file = document.getElementsByClassName(
            'fountain-img-input'
        )[0].files[0];
        if (!!file) {
            var fountainId = tmpl.data._id;
            file.fountainId = fountainId;
            FountainPictures.insert(file, function(err, fileObj) {
                if (err) return Errors.throw(err.reason);
                //when the image is uploaded
                var fountainPicId = fileObj._id;
                Meteor.subscribe('fountainPicture', fountainPicId);
                var cursor = FountainPictures.find(fountainPicId);
                var liveQuery = cursor.observe({
                    changed: function(newImage, oldImage) {
                        if (newImage.isUploaded()) {
                            liveQuery.stop();

                            //finally finished uploading
                            Meteor.call('addPicture',
                                fountainId, fountainPicId,
                                function(err, result) {
                                    if (err) return Errors.throw(err.reason);

                                    if (result.badFountainId) {
                                        return Errors.throw(
                                            'You can only add pictures to ' +
                                            'valid fountains.'
                                        );
                                    } else if (result.badFountainPicId) {
                                        return Errors.throw(
                                            'Invalid fountain picture id.'
                                        );
                                    } else if (result.success) {
                                        var newUrl = '/fountain/'+fountainId;
                                        newUrl += '/'+result.success;
                                        window.location.href = newUrl;
                                    }
                                }
                            );
                        }
                    }
                });
            });
        }
    }
});