import { watch } from 'chokidar';
import process from 'process';
import Builder from './Builder';
import { copyAssets } from './copy';

const watchMode = process.argv.includes('--watch');
const command = process.argv.includes('--copy-assets-only') ? 'copy' : 'build';

switch (command) {
  case 'build':
    const builder = new Builder({
      watchMode,
      onError: () => {
        if (!watchMode) {
          process.exit(1);
        }
      },
    });
    watch('app/**/*.css.ts', { persistent: watchMode })
      .on('add', (path) => {
        builder.registerPath(path);
        builder.build();
      })
      .on('unlink', (path) => {
        builder.unregisterPath(path);
        builder.build();
      })
      .on('change', () => {
        console.log('change');
        builder.build();
      })
      .on('ready', () => {
        builder.setReady();
        builder.build();
      });
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
