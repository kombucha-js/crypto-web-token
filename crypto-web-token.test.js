
const { CryptoWebToken } = require( './crypto-web-token.js' );


require('fs').writeFileSync( './tmp/pad4096.txt',  CryptoWebToken.createToken( 4096 ).toString('base64url'), 'utf-8' );
require('fs').writeFileSync( './tmp/salt4096.txt', CryptoWebToken.createToken( 4096 ).toString('base64url'), 'utf-8' );

const password = 'helloworld';
const pad      = Buffer.from( require('fs').readFileSync('./tmp/pad4096.txt', 'utf-8').trim(), 'base64url' );
const salt     = Buffer.from( require('fs').readFileSync('./tmp/salt4096.txt', 'utf-8').trim(), 'base64url' );

// console.log( onetimepad.length );

test("encryption && decryption", ()=>{
  var plain = {
    valuable_members1 : {
      is_owner     :false,
      is_admin     :false,
      is_user      :true,
      is_invisible :false,
    },
    valuable_members2 : {
      is_owner     :false,
      is_admin     :false,
      is_user      :true,
      is_invisible :false,
    },
    valuable_members : {
      is_owner     :false,
      is_admin     :false,
      is_user      :true,
      is_invisible :false,
    },
    wallter_members : {
      is_owner      : false,
      is_admin      : false,
      is_viewable   : true,
      is_sendable   : false,
      is_receivable : true,
    },
  };

  var encrypted = new CryptoWebToken(password,salt,pad ).encryptJSON( plain ) ;
  console.log({encrypted, size:(encrypted.length/1024.0) })
  var decrypted = new CryptoWebToken(password,salt,pad ).decryptJSON(encrypted);
  console.log({decrypted}); 
  expect( decrypted ).toStrictEqual( plain );
});
