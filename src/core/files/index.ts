/**
 * Copyright (c) Daniel Solarte Chaverra
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as FS from 'fs';
import Spooked from '@Spooked';

/**
 * Files interface.
 * @interface
 */
interface IFiles {
  setPath(path: string): IFiles;

  /**
   * Enter to a specific directory and then you can go to another directory or file on this.
   * 
   * @function
   * @param { string } name
   * @returns { IFiles }
   */
  directory(name: string): IFiles;

  /**
   * Enter to a specific file of the current directory.
   * 
   * @function
   * @param { string } name
   * @returns { IFiles }
   */
  file(name: string): IFiles;

  /**
   * Get the path of the current file or directory.
   * 
   * @function
   * @returns { string }
   */
  getPath(): string;

  /**
   * Get the path split in '/'.
   * 
   * @function
   * @returns { string[] }
   */
  getPaths(): string[];

  /**
   * Get the full path of the current file or directory.
   * 
   * @function
   * @returns { string }
   */
  getFullPath(): string;

  /**
   * Get the current directory name.
   * 
   * @function
   * @returns { string }
   */
  getDirectoryName(): string;

  /**
   * Check if the current path is a file and return the file name.
   * Otherwise, send an error.
   * 
   * @function
   * @returns { string }
   */
  getFileName(): string;

  /**
   * Check if the current path is a file.
   * 
   * @function
   * @returns { boolean }
   */
  isFile(): boolean;

  /**
   * Check if the current path is a directory.
   * 
   * @function
   * @returns { boolean }
   */
  isDirectory(): boolean;

  /**
   * Check if the current path exists.
   * 
   * @function
   * @returns { boolean }
   */
  exists(): boolean;

  /**
   * Create the directory or file if not exists.
   * 
   * @function
   * @param { boolean } as_directory
   * @returns { boolean }
   */
  create(as_directory: boolean): boolean;

  /**
   * Open a directory or file with the 'r' flag.
   * 
   * @function
   * @returns { FS.Dir | number }
   */
  open(): FS.Dir | number;

  /**
   * Open a directory or file with a flag.
   * 
   * @function
   * @param { string } flag File open flag.
   * @returns { FS.Dir | number }
   */
  open(flag: string): FS.Dir | number;

  /**
   * Read the directory or file.
   * 
   * @function
   * @returns { string | Buffer | string[] }
   */
  read(): string | Buffer | string[];

  /**
   * Read the directory or file.
   * 
   * @function
   * @param { any } options File read options.
   * @returns { string | Buffer | string[] }
   */
  read(options: any): string | Buffer | string[];

  /**
   * Copy a directory or file to a new path.
   * 
   * @function
   * @param { string } to_path
   * @returns { boolean }
   */
  copy(to_path: string): boolean;

  /**
   * Copy a directory or file to a new path.
   * 
   * @function
   * @param { string } to_path
   * @param { string } name New directory name.
   * @returns { boolean }
   */
  copy(to_path: string, name: string): boolean;

  /**
   * Delete the current directory or file if exists.
   * 
   * @function
   * @returns { boolean }
   */
  delete(): boolean;

  /**
   * Change the name of a directory or file.
   * 
   * @function
   * @param { string } name
   * @returns { boolean }
   */
  rename(name: string): boolean;
}

function files(): IFiles {
  let general_path: string = '';

  const files_return: IFiles = {
    setPath,
    directory: (name: string) => setPath(name),
    file: (name: string) => setPath(name),
    getPath: (): string => general_path,
    getPaths: function (): string[] {
      return this.getPath().split('/');
    },
    getFullPath: (): string => `${Spooked.root}/${general_path}`,
    getDirectoryName,
    getFileName,
    isFile: (): boolean => getFS().isFile(),
    isDirectory: (): boolean => getFS().isDirectory(),
    exists: function (): boolean {
      return FS.existsSync(this.getFullPath());
    },
    create,
    open,
    read,
    copy,
    delete: _delete,
    rename,
  };

  function setPath(path: string): IFiles {
    if (path.startsWith('\\') || path.startsWith('/')) {
      path = path.slice(1);
    }

    path = path.replace(Spooked.root, '').replace('\\', '/');

    if (general_path.length > 0 && !general_path.endsWith('/')) {
      general_path += `/${path}`;
    } else if (general_path.length > 0) {
      general_path += path;
    } else {
      general_path = path;
    }

    return files_return;
  }

  /**
   * Get the FS Stat of the current path.
   * 
   * @function
   * @private
   * @returns { FS.Stats }
   */
  function getFS(): FS.Stats {
    return FS.statSync(files_return.getFullPath());
  }

  function getDirectoryName(): string {
    let paths: string[] = files_return.getPaths();
    return files_return.isFile() ? paths[paths.length - 2] : paths[paths.length - 1];
  }

  function getFileName(): string {
    if (!files_return.isFile()) {
      throw new Error('The path is not a file.');
    }

    let paths: string[] = files_return.getPaths();
    return paths[paths.length - 1];
  }

  function create(as_directory: boolean): boolean {
    if (files_return.exists()) {
      throw new Error(`The ${files_return.isFile() ? 'file' : 'directory'} already exists.`);
    }

    if (as_directory) {
      FS.mkdirSync(files_return.getFullPath(), {
        recursive: true,
      });
    } else {
      files_return.open('w');
    }

    return true;
  }

  function open(flag: string = 'r'): FS.Dir | number {
    if (!files_return.exists()) {
      throw new Error('The path does not exist.');
    }

    if (files_return.isDirectory()) {
      return FS.opendirSync(files_return.getFullPath());
    }

    return FS.openSync(files_return.getFullPath(), flag);
  }

  function read(options: any = {}): string | Buffer | string[] {
    if (!files_return.exists()) {
      throw new Error('The path does not exist.');
    }

    if (files_return.isDirectory()) {
      return FS.readdirSync(files_return.getFullPath());
    }

    return FS.readFileSync(files_return.getFullPath(), options);
  }

  function copy(to_path: string, name: string = ''): boolean {
    if (!files_return.exists()) {
      throw new Error('The path does not exist.');
    }

    if (files_return.isDirectory()) {
      const explore = (path: string, new_path: string, next_name: string, back: boolean = false) => {
        let current_path = files().setPath(path);
        let next_path = files().setPath(new_path);

        if (back) {
          next_path.directory('..');
        }

        next_path.directory(next_name);

        if (next_path.create(true)) {
          let dir_files = current_path.read();

          if (typeof dir_files === 'object' && !Buffer.isBuffer(dir_files) && dir_files.length > 0) {
            dir_files.forEach((file: any) => {
              let next_file = files().setPath(path).file(file);

              if (next_file.exists()) {
                if (next_file.isDirectory()) {
                  explore(next_file.getPath(), next_path.getPath(), file);
                } else {
                  next_file.copy(`${next_path.getFullPath()}/${file}`);
                }
              }
            });
          }
        }
      };

      explore(files_return.getPath(), to_path, name || (files_return.getDirectoryName() + '_copy'), true);
    } else {
      FS.copyFileSync(files_return.getFullPath(), to_path);
    }

    return true;
  }

  function _delete(): boolean {
    if (!files_return.exists()) {
      throw new Error('The path does not exist.');
    }

    if (files_return.isDirectory()) {
      const explore = (path: string) => {
        let current_path = files().setPath(path);

        if (current_path.exists()) {
          let dir_files = current_path.read();

          if (typeof dir_files === 'object' && !Buffer.isBuffer(dir_files)) {
            if (dir_files.length === 0) {
              FS.rmdirSync(current_path.getFullPath());
            } else {
              dir_files.forEach((file: any) => {
                let next_file = files().setPath(path).file(file);

                if (next_file.exists()) {
                  if (next_file.isDirectory()) {
                    explore(next_file.getPath());
                  } else {
                    next_file.delete();
                  }

                  explore(files_return.getPath());
                }
              });
            }
          }
        }
      };

      explore(files_return.getPath());
    } else {
      FS.unlinkSync(files_return.getFullPath());
    }

    return true;
  }

  function rename(name: string): boolean {
    if (!files_return.exists()) {
      throw new Error('The path does not exist.');
    }

    if (files_return.isDirectory()) {
      const copied = files_return.copy(files_return.getPath(), name);

      if (copied && files_return.delete()) {
        FS.rmdirSync(files_return.getFullPath());
      }
    } else {
      FS.renameSync(files_return.getFullPath(), `${files_return.getDirectoryName()}/${name}`);
    }

    return true;
  }

  return files_return;
}

/**
 * Export default values.
 * @exports
 */
export default files;
