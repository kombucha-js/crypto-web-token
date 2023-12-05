
import { CryptoWebToken } from  './crypto-web-token.mjs' ;
import { readSettings } from 'asynchronous-context/settings';
import  fs from 'fs';
import { CryptoWebTokenError } from 'crypto-web-token';

const settingsFile = readSettings( e=>typeof e?.crypto_web_token?.tokenizer_password === 'string' );
const TOKENIZER_PASSWORD = settingsFile?.crypto_web_token?.tokenizer_password;
console.log( '[authentication-context] TOKENIZER_PASSWORD', TOKENIZER_PASSWORD );

// const TOKENIZER_PASSWORD = process.env.TOKENIZER_PASSWORD ?? (()=>{throw new Error('environment variable TOKENIZER_PASSWORD cannot be null')})();
// const TOKENIZER_PASSWORD = 'helloworldfoobarbuz';


const TOKENIZER_DIR= './tokenizer-data';
const TOKENIZER_PADDING_FILE = `${TOKENIZER_DIR}/tokenizer-padding.txt`;
const TOKENIZER_SALT_FILE    = `${TOKENIZER_DIR}/tokenizer-salt.txt`;

const TOKENIZER_DATA  = {
  TOKENIZER_SALT    : null,
  TOKENIZER_PADDING : null,
  loaded : false,
};

function generateSaltIfNotExist() {
  if ( ! fs.existsSync( TOKENIZER_DIR ) ) {
    console.log( '[authentication-context] salt and padding for tokenizer do not exist; generating new one.' );
    return generateSalt();
  } else {
    console.log( '[authentication-context] salt and padding for tokenizer already exist; use the preexisting data.' );
  }
}
export { generateSaltIfNotExist };

function generateSalt() {
  fs.mkdirSync(     TOKENIZER_DIR, { recursive: true });
  fs.writeFileSync( TOKENIZER_SALT_FILE,    CryptoWebToken.createToken( 1024*16 ).toString('base64url'), 'utf-8' );
  fs.writeFileSync( TOKENIZER_PADDING_FILE, CryptoWebToken.createToken( 1024*16 ).toString('base64url'), 'utf-8' );
}
export { generateSalt };

function resetSalt() {
  TOKENIZER_DATA.TOKENIZER_SALT    = null;
  TOKENIZER_DATA.TOKENIZER_PADDING = null;
  TOKENIZER_DATA.loaded = false;
}

function loadSalt() {
  TOKENIZER_DATA.TOKENIZER_SALT    = Buffer.from( fs.readFileSync( TOKENIZER_SALT_FILE,    'utf-8' ).trim(), 'base64url' );
  TOKENIZER_DATA.TOKENIZER_PADDING = Buffer.from( fs.readFileSync( TOKENIZER_PADDING_FILE, 'utf-8' ).trim(), 'base64url' );
  TOKENIZER_DATA.loaded = true;
}

function loadSaltLazily() {
  if  ( ! TOKENIZER_DATA.loaded ) {
    loadSalt();
  }
}

function dateReviver(k,v) {
  return (typeof v === 'string') &&
    v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(Z|([+\-])(\d{2}):(\d{2}))$/ ) ?  new Date(v) : v;
}

function encodeToken( jsonPlainText ) {
  loadSaltLazily();
  return new CryptoWebToken(TOKENIZER_PASSWORD, TOKENIZER_DATA.TOKENIZER_SALT, TOKENIZER_DATA.TOKENIZER_PADDING).encryptJSON( jsonPlainText );
}
function decodeToken( jsonCipherText ) {
  loadSaltLazily();
  return new CryptoWebToken(TOKENIZER_PASSWORD, TOKENIZER_DATA.TOKENIZER_SALT, TOKENIZER_DATA.TOKENIZER_PADDING).decryptJSON( jsonCipherText, dateReviver );
}

export { encodeToken };
export { decodeToken };
export { CryptoWebTokenError, CryptoWebTokenError as TokenError };

