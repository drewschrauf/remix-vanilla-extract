import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import { writeFile } from 'fs/promises';
import { basename, dirname } from 'path';
import { build as buildBundle } from 'tsup';
import { ASSET_FILE_TYPES } from './constants';
import { copyAssets, copyBundle } from './copy';

export default class Builder {
  private watchMode: boolean;
  private onError: (err: unknown) => void;
  private ready = false;
  private paths: string[] = [];

  constructor({
    watchMode,
    onError,
  }: {
    watchMode: boolean;
    onError: (err: unknown) => void;
  }) {
    this.watchMode = watchMode;
    this.onError = onError;
  }

  public setReady() {
    this.ready = true;
  }

  public registerPath(path: string) {
    this.paths.push(path);
  }

  public unregisterPath(path: string) {
    this.paths.splice(this.paths.indexOf(path), 1);
  }

  public async build() {
    try {
      if (!this.ready) return;

      await this.buildRegistry();
      await this.buildBundle();
      await copyAssets();
      await copyBundle();
    } catch (err) {
      console.error('Unable to build');
      console.error(err);

      this.onError(err);
    }
  }

  private async buildRegistry(): Promise<void> {
    const dups = this.findDuplicatePaths();
    if (dups.length !== 0) {
      console.error(`Found css file with duplicate name "${dups[0].base}"`);
      console.error(`    ${dups[0].path}`);
      console.error(`    ${dups[1].path}`);
      console.error('Not rebuilding registry');

      throw new Error('Duplicates found');
    }

    const contents = this.paths
      .map((path) => {
        return `export * as ${basename(path, '.css.ts')} from "../${dirname(
          path
        )}/${basename(path, '.ts')}";`;
      })
      .join('\n');

    await writeFile('styles/registry.ts', contents, { encoding: 'utf8' });
  }

  private async buildBundle(): Promise<void> {
    await buildBundle({
      clean: !this.watchMode,
      entry: ['styles/index.ts'],
      outDir: '.styles',
      splitting: false,
      sourcemap: this.watchMode ? 'inline' : false,
      dts: { resolve: true },
      format: 'cjs',
      loader: ASSET_FILE_TYPES.reduce(
        (acc, ft) => ({ ...acc, [`.${ft}`]: 'file' }),
        {}
      ),
      esbuildPlugins: [
        vanillaExtractPlugin({
          identifiers: this.watchMode ? 'debug' : 'short',
        }) as any,
      ],
    });
  }

  private findDuplicatePaths() {
    const names = this.paths.map((path) => ({
      path,
      base: basename(path, '.css.ts'),
    }));
    let dups: { path: string; base: string }[] = [];

    for (let i = 0; i < names.length; i++) {
      const dup = names
        .slice(i + 1)
        .find((name) => name.base === names[i].base);
      if (dup) {
        dups.push(names[i], dup);
        break;
      }
    }

    return dups;
  }
}
