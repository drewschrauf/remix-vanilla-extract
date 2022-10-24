import process from 'process';
import Builder from './Builder';
import { copyAssets } from './copy';

const watchMode = process.argv.includes('--watch');
const command = process.argv.includes('--copy-assets-only') ? 'copy' : 'build';

switch (command) {
  case 'build':
    new Builder(watchMode).start();
    break;
  case 'copy':
    copyAssets()
      .then(() => {
        process.exit(0);
      })
      .catch((err) => {
        console.error('Unable to copy assets');
        console.error(err);
        process.exit(1);
      });
    break;
}
