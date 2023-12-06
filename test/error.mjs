
import "./error.init.mjs";
import { test, describe, it, before, after }     from   'node:test'  ;
import assert     from   'node:assert/strict'  ;
import { generateSaltIfNotExist } from 'crypto-web-token/tokenizer';
import {
  encodeToken,decodeToken,TokenError
} from 'crypto-web-token/tokenizer';


before( ()=>{
  generateSaltIfNotExist();
});

test( 'error', ()=>{
  const i = { 'hello' : 'foo', 'world': 'bar' };
  const c = encodeToken( i );
  console.log( 'cipher text' , c );
  const o = decodeToken( c );
  assert.deepEqual( o, i );
});
