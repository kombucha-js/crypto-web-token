
import { test, describe, it, before, after }     from   'node:test'  ;
import assert     from   'node:assert/strict'  ;
import { spawn } from "node:child_process";

before( ()=>{
});

await test( 'error',  ()=>{
  return new Promise( (resolve,reject)=>{
    const ps = spawn( 'node',[ './error.mjs' ]);
    let stdoutStr = '';
    let stderrStr = '';

    ps.on('close', (code)=>{
      console.error( stdoutStr.replaceAll( /^/gm, 'stdout>> ' ) );
      console.error( stderrStr.replaceAll( /^/gm, 'stderr>> ' ) );
      if (code===1 ) {
        resolve( 'expected result 1' );
      } else {
        reject( 'expected error code 1 but get zero' );
      }
    });
    // process.stderr.write( data.toString().replaceAll( /(\r\n|\n\r|\r|\n)/gm, (p0,p1)=>`${p1}stdout>> ` ) );
    ps.stdout.on('data',(data)=>{
      stdoutStr += data.toString();
      //process.stderr.write( data.toString().replaceAll( /^/gm, 'stdout>> ' ) );
    });

    ps.stderr.on('data',(data)=>{
      stderrStr += data.toString();
      //process.stderr.write( data.toString().replaceAll( /^/gm, 'stderr>> ' ) );
    });
  });


});
