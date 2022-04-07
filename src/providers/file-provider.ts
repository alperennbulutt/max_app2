import { Injectable } from '@angular/core';
import { File, IWriteOptions } from '@ionic-native/file';
import { Platform, normalizeURL } from '@ionic/angular';

@Injectable()
export class FileProvider {
  public libraryPath: string;
  public sourcepath: string;

  constructor(public file: File, public platform: Platform) {
    this.getLibraryPaths();
  }

  private getLibraryPaths(): void {
    this.platform.ready().then(() => {
      if (this.platform.is('ios')) {
        this.libraryPath = this.file.dataDirectory;
        this.sourcepath = this.file.tempDirectory;
      } else if (this.platform.is('android')) {
        this.libraryPath = this.file.dataDirectory;
        this.sourcepath = this.file.externalCacheDirectory;
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public listDir(path: string, dirName: string): Promise<any> {
    return new Promise((resolve: any) => {
      this.file
        .listDir(path, dirName)
        .then((dirList: any) => {
          resolve(dirList);
        })
        .catch((error: any) => {
          console.log('dir doesnt exist:', error);
        });
    });
  }

  public listDirFromLibrary(dirName: string): Promise<any> {
    return new Promise((resolve: any) => {
      this.listDir(this.libraryPath, dirName)
        .then((dirList: any) => {
          resolve(dirList);
        })
        .catch((error: any) => {
          console.log('error', error);
        });
    });
  }

  public getFromLibrary(dirName: string): Promise<any> {
    return new Promise((resolve: any) => {
      this.file
        .listDir(this.libraryPath, dirName)
        .then((files: any) => {
          resolve(files);
        })
        .catch((err) => {
          resolve();
          console.log('ophalen file niet gelukt', err);
        });
    });
  }

  public removeFile(dirName: string, filename: string): Promise<any> {
    return new Promise((resolve: any) => {
      this.file
        .removeFile(this.libraryPath + '/' + dirName, filename)
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          console.log('niet geluuuukt delete', err);
        });
    });
  }

  public saveToLibrary(dirName: string, filename: string): Promise<any> {
    console.log('aanroepen fn: save to library', dirName);
    filename = filename.toLocaleLowerCase();

    // For selecting an photo from library
    if (filename.search('img') > -1) {
      filename = filename.replace('img', 'IMG');
      filename = filename.split('?')[0];
    }

    if (filename.search(/\?/) > -1) {
      filename = filename.split('?')[0];
    }

    return new Promise((resolve: any) => {
      this.file
        .checkDir(this.libraryPath, dirName)
        .then((data: any) => {
          if (data) {
            const timeStamp: any = +new Date();
            const newFile: string = timeStamp + '_' + filename;
            this.file
              .copyFile(
                this.sourcepath,
                filename,
                this.libraryPath + '/' + dirName,
                newFile
              )
              .then((image: any) => {
                resolve(image);
              })
              .catch((err) => {
                console.log('copy error', err);
              });
          }
        })
        .catch((checkDirErr) => {
          this.file
            .createDir(this.libraryPath, dirName, false)
            .then((dirCreated: any) => {
              if (dirCreated) {
                console.log('Doesnt exist, making dir...', checkDirErr);
                this.saveToLibrary(dirName, filename).then((image: any) => {
                  resolve(image);
                });
              }
            })
            .catch((err) => {
              console.log('Something went wrong', err);
            });
        });
    }).catch((err) => {
      console.log('oeps', err);
    });
  }

  public writeFileToLibrary(
    dirName: string,
    filename: string,
    file: any,
    options: IWriteOptions
  ): Promise<any> {
    return new Promise((resolve: any) => {
      this.file
        .writeFile(this.libraryPath + '/' + dirName, filename, file, options)
        .then((data: any) => {
          resolve(data);
        })
        .catch((err) => {
          this.file
            .createDir(this.libraryPath, dirName, false)
            .then((dirCreated: any) => {
              if (dirCreated) {
                console.log('Doesnt exist, making dir...', err);
                this.writeFileToLibrary(dirName, filename, file, options).then(
                  (image: any) => {
                    resolve(image);
                  }
                );
              }
            })
            .catch((err) => {
              console.log('Something went wrong', err);
            });
        });
    });
  }

  public getLibraryUrl(dirName?: string): string {
    let path: string;
    if (dirName) {
      path = this.libraryPath + dirName;
    } else {
      path = this.libraryPath;
    }
    return path;
  }
}
