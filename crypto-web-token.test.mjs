
import { test, describe, it, before, after }     from   'node:test'  ;
import assert     from   'node:assert/strict'  ;
import { CryptoWebToken } from  './crypto-web-token.mjs' ;
import { mkdir, writeFile, readFile }  from 'fs/promises';

await mkdir( './tmp/foo/bar', { recursive: true } );

await writeFile( './tmp/foo/bar/pad4096.txt',  CryptoWebToken.createToken( 4096 ).toString('base64url'), 'utf-8' );
await writeFile( './tmp/foo/bar/salt4096.txt', CryptoWebToken.createToken( 4096 ).toString('base64url'), 'utf-8' );

const password = 'helloworld';
const pad      = Buffer.from( (await readFile('./tmp/foo/bar/pad4096.txt',  'utf-8')).trim(), 'base64url' );
const salt     = Buffer.from( (await readFile('./tmp/foo/bar/salt4096.txt', 'utf-8')).trim(), 'base64url' );

// console.log( onetimepad.length );

test( "encryption && decryption", ()=>{
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

  var encrypted = new CryptoWebToken( password, salt, pad ).encryptJSON( plain );
  console.log({encrypted, size:(encrypted.length/1024.0) })

  var decrypted = new CryptoWebToken( password, salt, pad ).decryptJSON( encrypted );
  console.log({decrypted});

  assert.deepEqual( decrypted, plain );
});

