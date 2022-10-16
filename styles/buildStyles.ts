import { watch } from 'chokidar';
import { writeFileSync } from 'fs';
import { basename, dirname } from 'path';
import { build as buildBundle } from 'tsup';
import process from 'process';
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';

const watchMode = process.argv.includes('--watch');

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

const buildRegistry = () => {
  if (!ready) return;

  const dups = findDuplicatePaths();
  if (dups.length !== 0) {
    console.error(`Found css file with duplicate name "${dups[0].base}"`);
    console.error(`    ${dups[0].path}`);
    console.error(`    ${dups[1].path}`);
    console.error('Not rebuilding registry');

    if (!watchMode) {
      process.exit(1);
    }

    return;
  }

  const contents = paths
    .map((path) => {
      return `export * as ${basename(path, '.css.ts')} from "../${dirname(
        path
      )}/${basename(path, '.ts')}"`;
    })
    .join('\n');

  writeFileSync('styles/registry.ts', contents, { encoding: 'utf8' });
};

watch('app/**/*.css.ts', { persistent: watchMode })
  .on('add', (path) => {
    paths.push(path);
    buildRegistry();
  })
  .on('unlink', (path) => {
    paths.splice(paths.indexOf(path), 1);
    buildRegistry();
  })
  .on('ready', () => {
    ready = true;
    buildRegistry();
    buildBundle({
      watch: watchMode,
      clean: !watchMode,
      entry: ['styles/index.ts'],
      outDir: 'app/styles',
      splitting: false,
      sourcemap: true,
      dts: true,
      format: 'cjs',
      esbuildPlugins: [
        vanillaExtractPlugin({
          identifiers: watchMode ? 'debug' : 'short',
        }) as any,
      ],
    });
  });
