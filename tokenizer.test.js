
const {
  encodeToken,decodeToken,TokenError
} = require('crypto-web-token/tokenizer');

beforeAll( ()=>{
  require('crypto-web-token/tokenizer.js' ).generateSaltIfNotExist();
});

test( 'tokenizer1', ()=>{
  const i = { 'hello' : 'foo', 'world': 'bar' };
  const c = encodeToken( i );
  console.log( 'cipher text' , c );
  const o = decodeToken( c );
  expect( o ).toEqual( i );

});
