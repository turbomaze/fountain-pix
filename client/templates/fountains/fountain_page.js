function onSwipeLeft(maxIdx) {
    var oldIdx = Session.get('idxToShow') || 0;
    var newIdx = (oldIdx + 1)%maxIdx;
    Session.set('idxToShow', newIdx);
    document.getElementById('fountain-pic-'+oldIdx).className = 'hide';
    document.getElementById('fountain-pic-'+newIdx).className = 'show';
    var fountainId = window.location.href.split('/')[4];
    window.history.pushState('', '', '/fountain/'+fountainId+'/'+newIdx);
}

function onSwipeRight(maxIdx) {
    var oldIdx = Session.get('idxToShow') || 0;
    var newIdx = (oldIdx - 1 + maxIdx)%maxIdx;
    document.getElementById('fountain-pic-'+oldIdx).className = 'hide';
    document.getElementById('fountain-pic-'+newIdx).className = 'show';
    Session.set('idxToShow', newIdx);
    var fountainId = window.location.href.split('/')[4];
    window.history.pushState('', '', '/fountain/'+fountainId+'/'+newIdx);
}

Template.fountainPage.onCreated(function() {
    Session.set('mouseDownLoc', [0, 0]);
    Session.set('idxToShow', parseInt(Router.current().params._idx));
});

Template.fountainPage.events({
    'mousedown .fountain-image-row': function(e, tmpl) {
        Session.set('mouseDownLoc', [e.pageX, e.pageY]);
    },
    'touchstart .fountain-image-row': function(e, tmpl) {
        Session.set('mouseDownLoc', [
            e.originalEvent.touches[0].pageX,
            e.originalEvent.touches[0].pageY
        ]);
    },
    'mouseup .fountain-image-row': function(e, tmpl) {
        var diff = e.pageX - Session.get('mouseDownLoc')[0];
        if (Math.abs(diff) < 30) return false;
        else if (diff < 0) onSwipeLeft(tmpl.data.maxIdx);
        else onSwipeRight(tmpl.data.maxIdx);
    },
    'touchend .fountain-image-row': function(e, tmpl) {
        var diff = e.originalEvent.changedTouches[0].pageX;
        diff -= Session.get('mouseDownLoc')[0];
        if (Math.abs(diff) < 30) return false;
        else if (diff < 0) onSwipeLeft(tmpl.data.maxIdx);
        else onSwipeRight(tmpl.data.maxIdx);
    }
});