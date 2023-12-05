
import crypto        from 'crypto';
import zlib          from 'zlib';
import {JSONWrapper} from './json-wrapper.mjs';

// replace(/x/g,'xx').replace(/-/g,'xa').replace(/_/g,'xb');
//

class CryptoWebTokenError extends Error {
  constructor (...args){
    super(...args);
  }
}
export { CryptoWebTokenError, CryptoWebTokenError as TokenError };


// A one-time pad implementation that its ouput consists both the encripted
// text and its secret key. This library is not intended to be used as an
// encryption scheme but as a scrambler which simply ensures that the same text
// representation becomes different after encoding.
const scrambler = {
  encrypt( input ) {
    const result =  Buffer.allocUnsafe( input.length * 2 );
    const random = crypto.randomBytes( input.length );
    for ( let i=0; i<input.length; i++ ) {
      const ri = i*2;
      result[ri+0] = random[i];
      result[ri+1] = input[i] ^ random[i];
    }
    return result;
  },
  decrypt( input ) {
    const result = Buffer.allocUnsafe( Math.floor( input.length / 2 ));
    for ( let i=0; i<result.length; i++ ) {
      const ri = i*2;
      result[i] = input[ri] ^ input[ri+1];
    }
    return result;
  }
};


class CryptoWebToken {
  static createToken(size) {
    return crypto.randomBytes(size).toString( 'base64url' );
  }
  static xor(input, pad) {
    let result = [];
    for ( let i=0; i<input.length; i++ ) {
      result[i] = input[i] ^ pad[ i % pad.length ];
    }
    return Buffer.from( result );
  }

  constructor( password, salt, pad ) {
    this.key  = crypto.createHash('sha512').update( password.toString() ).digest().slice(0,256/8);
    this.salt = Buffer.from( salt.toString(), 'base64url' );
    this.pad = Buffer.from( pad.toString(), 'base64url' );
  }

  encryptJSON( jsonObject ) {
    let text0 = JSONWrapper.stringify(jsonObject);
    text0=text0.trim();
    // text0=text0.substring(1,text0.length-1);
    // console.log({text0});
    return this.encrypt( text0 );
  }
  encrypt(text0) {
    text0 = zlib.deflateSync(text0);
    text0 = scrambler.encrypt( Buffer.from( text0, 'utf-8' ));

    {
      const algorithm  = "aes-256-cbc";
      const initVector =  Buffer.allocUnsafe(16);
      crypto.randomBytes(16).copy(initVector);

      const securitykey = this.key;
      const cipher = crypto.createCipheriv( algorithm, securitykey, initVector );

      let buffers = [];
      buffers.push( cipher.update( text0, 'utf-8' ) );
      buffers.push( cipher.final() );
      const buffer = Buffer.concat( buffers );
      const text   = buffer.toString( 'base64url' );
      const iv     = initVector.toString( 'base64url' );
      const hash   = crypto.createHash('sha512').update( CryptoWebToken.xor( buffer, this.salt ) ).update( CryptoWebToken.xor( initVector, this.salt )).digest().toString( 'base64url' );

      text0 = Buffer.from( JSONWrapper.stringify( { text ,iv, hash } ), 'utf-8' );
      // console.log({json:JSONWrapper.stringify( { text ,iv, hash } )});
    }
    text0  = CryptoWebToken.xor( text0, this.pad );
    // text0  = scrambler.encrypt( text0 );
    return text0.toString( 'base64url' ) ;
  }
  decryptJSON(text0, jsonReviver ) {
    // console.log( {step:1,text0} );
    return JSONWrapper.parse( this.decrypt( text0 ), jsonReviver );
  }

  decrypt(text0) {
    text0 = Buffer.from( text0, 'base64url' );
    // console.log( {step:2,text0} );
    text0 = CryptoWebToken.xor( text0, this.pad );
    // console.log( {step:3,text0} );

    {
      // console.log( {step:4,text0:text0.toString( 'utf-8' )} );
      let jsonObject;
      try {
        jsonObject = JSONWrapper.parse( text0.toString( 'utf-8' ));
      } catch ( e ) {
        if ( e instanceof SyntaxError ) {
          throw new CryptoWebTokenError( 'invalid json ERR_000' );
        } else {
          throw e;
        }
      }

      if ( ! ('iv' in jsonObject ) || ! ('text' in jsonObject ) || ! ( 'hash' in jsonObject ) ) {
        throw new CryptoWebTokenError( 'invalid json ERR_001' );
      }

      const text        = Buffer.from( jsonObject.text, 'base64url' );
      const algorithm   = "aes-256-cbc";
      const securitykey = this.key;
      const initVector  = Buffer.allocUnsafe(16);
      Buffer.from( jsonObject.iv, 'base64url' ).copy( initVector );

      const hashExpected = crypto.createHash('sha512').update( CryptoWebToken.xor( text, this.salt ) ).update( CryptoWebToken.xor( initVector, this.salt )).digest();
      const hashActual   = Buffer.from( jsonObject.hash, 'base64url' );

      // XXX Is this comparison really working? This should be tested again. (Tue, 30 Aug 2022 11:54:52 +0900)
      if ( Buffer.compare( hashExpected, hashActual ) !== 0 ) {
        throw new CryptoWebTokenError( 'invalid json ERR_002' );
      }

      const c = crypto.createDecipheriv( algorithm, securitykey, initVector );

      let buffers = [];
      buffers.push( c.update( text, 'base64url' ) );
      buffers.push( c.final() );

      text0 = Buffer.concat( buffers );
    }

    text0 = scrambler.decrypt( text0 );
    text0 = zlib.inflateSync( text0 );

    return text0.toString('utf-8');
  }
}
export { CryptoWebToken };


// function encryptJSON(text) {
//   JSONWrapper.stringify(json);
// }
// module.exports.encryptJSON = encryptJSON;
//
// function decryptJSON(base64url) {
// }
// module.exports.decryptJSON = decryptJSON;
//
// function isLoggedIn(json) {
// }
// module.exports.isLoggedIn = isLoggedIn;
//
// // console.log( CryptoWebToken.createToken( 2048 ));
// const password = 'helloworld';
// const pad = Buffer.from( require('fs').readFileSync('./randomtoken2048.txt', 'utf-8').trim(), 'base64url' );
//
// // console.log( pad.length );
//
// var encrypted = new CryptoWebToken(password,pad).encryptJSON({hello:'world'}) ;
// console.log({encrypted})
//
// var decrypted = new CryptoWebToken(password,pad).decryptJSON(encrypted);
// console.log({decrypted});
//


// var deflated = zlib.deflateSync(input).toString('base64');
// var inflated = zlib.inflateSync(new Buffer(deflated, 'base64')).toString();
//
// console.log(inflated);

