"use strict";

class Ringmatcher {

  constructor(){
    this.codes = {};
    this.listener = {};
    this.codeMax = 0;
    this.touchCodes = {};
    this.touchCodeMax = 0;
    this.touchBuffer = [];
    this.buffer = [];
    this.start = null;
  }

  process( buf, codes, codeMax, prepro ){
    prepro = prepro||Object;
    codeLoop:
    for( var k in codes ){
      var bc = prepro([codes[k],buf]);
      var code = bc[0];
      var buffer = bc[1];
      if( buffer.length >= code.length ){
        var i = code.length;
        var j = buffer.length;
        while( j--, i-- )
          if( buffer[j] != code[i] )
            continue codeLoop;
        if( k in this.listener )
          this.listener[k].forEach(f=>f());
      }
    }
  }

  segment(w,h){
    var rad = w > 0
            ? Math.PI - Math.acos( (h>0?1:-1) * Math.sqrt( h*h / ( w*w + h*h ) ) )
            : Math.PI + Math.acos( (h>0?1:-1) * Math.sqrt( h*h / ( w*w + h*h ) ) )
    ;
    var n = 8;
    return (((( 0.5 + rad * n / Math.PI / 2 )%n)+n)%n);
  }

  doMove( x, y, x2, y2 ){
    this.touchBuffer.push([x,y,x2,y2]);
    if( this.touchBuffer.length > this.touchCodeMax )
      this.touchBuffer.splice(0,1);
    this.process( this.touchBuffer, this.touchCodes, this.touchCodeMax, cb => {
      var buffer = cb[1].map( (b) => Math.floor(this.segment(b[2]-b[0],b[3]-b[1])) );
      return [cb[0],buffer];
    });
  }

  addCode( name, keys ){
    var code = Array.prototype.concat.apply([],
      Array.prototype.slice.apply( keys ).map( key => {
        if( typeof key == "string" )
          return Array.prototype.slice.apply( key ).map( k => k.charCodeAt(0) );
        if( key instanceof Array )
          return key;
        return [key];
      })
    );
    if( this.codeMax < code.length )
      this.codeMax = code.length;
    this.codes[name] = code;
  }

  addTouchCode( name, touchs ){
    if( this.touchCodeMax < touchs.length )
      this.touchCodeMax = touchs.length;
    this.touchCodes[name] = touchs.map( t => ({
      1:0,  3:1, 2:2, 6:3,
      4:4, 12:5, 8:6, 9:7
    })[t] );
  }

  addListener( name, func ){
    (this.listener[name]=this.listener[name]||[]).push(func);
  }

  doTouchStart( id, x, y ){
    if(this.start)
      return;
    this.start = { id, x, y };
  }

  doTouchEnd( id, x, y ){
    if( !this.start || id != this.start.id )
      return;
    this.doMove( this.start.x, this.start.y, x, y );
  }

  doInput( x ){
    if( !x ) return;
    if( typeof x == "string" ){
      for( var c of x )
        this.doInput( c.charCodeAt(0) );
      return;
    }
    this.buffer.push( x );
    if( this.buffer.length > this.codeMax )
      this.buffer.splice(0,1);
    this.process( this.buffer, this.codes, this.codeMax );
  }

}

const R_UP    = 1<<0;
const R_RIGHT = 1<<1;
const R_DOWN  = 1<<2;
const R_LEFT  = 1<<3;
