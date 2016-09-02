"use strict";

var ringmatcher = new Ringmatcher();

addEventListener( "keydown", function(event){
  if( event.ctrlKey || event.altKey || event.keyCode == 13 ||
    document.activeElement && (
        document.activeElement instanceof HTMLInputElement
     || document.activeElement instanceof HTMLTextAreaElement
    )
  ) return;
  event.preventDefault();
  ringmatcher.doInput( event.keyCode );
});

addEventListener( "touchstart", function(event){
  var touch = event.touches[0];
  ringmatcher.doTouchStart( touch.identifier, touch.screenX, touch.screenY );
});

addEventListener( "touchend", function(event){
  for( var t=event.changedTouches,i=t.length; i--; )
    ringmatcher.doTouchEnd( t[i].identifier, t[i].screenX, t[i].screenY );
});
