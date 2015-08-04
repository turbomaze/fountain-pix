Template.fountainUploadForm.events({
    'click .fountain-sbmt': function (e, tmpl) {
        e.preventDefault();

        var file = document.getElementsByClassName(
            'fountain-img-input'
        )[0].files[0];
        if (!!file) {
            FountainPictures.insert(file, function (err, fileObj) {
                if (err) return Errors.throw(err.reason);

                var fountainId = Fountains.insert({
                    imageRef: fileObj._id
                });
                Router.go('fountainPage', {_id: fountainId});
            });
        }
    }
});