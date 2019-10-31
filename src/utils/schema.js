import fs from 'fs';
import path from 'path';

export default type =>
  new Promise((resolve, reject) => {
    const pathToSchema = path.join(
      process.cwd(),
      `src/types/${type}/${type}.gql`
    );
    fs.readFile(pathToSchema, { encoding: 'utf-8' }, (err, schema) => {
      if (err) {
        return reject(err);
      }
      return resolve(schema);
    });
  });
