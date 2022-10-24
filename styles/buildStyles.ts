import { watch } from 'chokidar';
import { writeFile } from 'fs/promises';
import { basename, dirname } from 'path';
import { build as buildBundle } from 'tsup';
import process, { exit } from 'process';
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import type { Options as CopyFilesOptions } from 'copyfiles';
import copyfilesActual from 'copyfiles';

const ASSET_FILE_TYPES = ['woff', 'png'];

const watchMode = process.argv.includes('--watch');
const copyFilesOnly = process.argv.includes('--copy-files-only');

const copyfiles = (paths: string[], options: CopyFilesOptions) =>
  new Promise<void>((resolve, reject) =>
    copyfilesActual(paths, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  );

if (copyFilesOnly) {
  copyfiles(
    [
      ...ASSET_FILE_TYPES.map((ft) => `.styles/*.${ft}`),
      'public/build/_assets',
    ],
    {
      flat: true,
      up: true,
      soft: true,
    }
  ).then(() => {
    exit(0);
  });
}

let ready = false;
const paths: string[] = [];

const findDuplicatePaths = () => {
  const names = paths.map((path) => ({
    path,
    base: basename(path, '.css.ts'),
  }));
  let dups: { path: string; base: string }[] = [];

  for (let i = 0; i < names.length; i++) {
    const dup = names.slice(i + 1).find((name) => name.base === names[i].base);
    if (dup) {
      dups.push(names[i], dup);
      break;
    }
  }

  return dups;
};

const build = async () => {
  try {
    if (!ready) return;

    const dups = findDuplicatePaths();
    if (dups.length !== 0) {
      console.error(`Found css file with duplicate name "${dups[0].base}"`);
      console.error(`    ${dups[0].path}`);
      console.error(`    ${dups[1].path}`);
      console.error('Not rebuilding registry');

      throw new Error('Duplicates found');
    }

    const contents = paths
      .map((path) => {
        return `export * as ${basename(path, '.css.ts')} from "../${dirname(
          path
        )}/${basename(path, '.ts')}";`;
      })
      .join('\n');

    await writeFile('styles/registry.ts', contents, { encoding: 'utf8' });
    await buildBundle({
      clean: !watchMode,
      entry: ['styles/index.ts'],
      outDir: '.styles',
      splitting: false,
      sourcemap: true,
      dts: { resolve: true },
      format: 'cjs',
      loader: ASSET_FILE_TYPES.reduce(
        (acc, ft) => ({ ...acc, [`.${ft}`]: 'file' }),
        {}
      ),
      esbuildPlugins: [
        vanillaExtractPlugin({
          identifiers: watchMode ? 'debug' : 'short',
        }) as any,
      ],
    });
    await copyfiles(
      [
        ...ASSET_FILE_TYPES.map((ft) => `.styles/*.${ft}`),
        'public/build/_assets',
      ],
      {
        flat: true,
        up: true,
        soft: true,
      }
    );
    await copyfiles(
      [
        '.styles/*.js',
        '.styles/*.d.ts',
        '.styles/*.css',
        '.styles/*.map',
        'app/styles',
      ],
      {
        flat: true,
        up: true,
      }
    );
  } catch (err) {
    console.error('Unable to build');
    console.error(err);

    if (!watchMode) {
      process.exit(1);
    }
  }
};

watch('app/**/*.css.ts', { persistent: watchMode })
  .on('add', (path) => {
    paths.push(path);
    build();
  })
  .on('unlink', (path) => {
    paths.splice(paths.indexOf(path), 1);
    build();
  })
  .on('change', () => {
    build();
  })
  .on('ready', () => {
    ready = true;
    build();
  });
