import type { Options as CopyFilesOptions } from 'copyfiles';
import copyfilesActual from 'copyfiles';
import { ASSET_FILE_TYPES } from './constants';

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

export const copyBundle = (): Promise<void> =>
  copyfiles(
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

export const copyAssets = (): Promise<void> =>
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
  );
