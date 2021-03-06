import { insertEnergyFile, saveEnergyFiles } from './model';
import streamBodyParser from 'restify-jsonstream-bodyparser';
import map from 'through2-map';
import multipipe from 'multipipe';
import through2 from 'through2';
import { stringify } from 'JSONStream';

function resolve(promisedInsertResult, enc, cb) {
  promisedInsertResult
    .then(res => {
      this.push(res);
      cb();
    })
    .catch(cb);
}

export async function saveBareEnergyFiles(req, res) {
  const results = await saveEnergyFiles();
  res.send(results);
}

export const insertBareEnergyFile = () => [
  streamBodyParser(),
  (req, res) => {
    const insertAll = multipipe(
      map.obj(insertEnergyFile),
      through2.obj(resolve),
      stringify(),
      res
    );

    insertAll.on('error', err => {
      process.stderr.write('Error occurred, but 200 already sent\n\n');
      process.stderr.write(err.stack);
      res.end();
    });

    res.status(200);
    req.body.pipe(insertAll);
  }
];
