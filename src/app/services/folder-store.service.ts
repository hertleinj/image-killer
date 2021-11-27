import { Injectable, NgZone } from "@angular/core";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { Picture } from "../models/picture.model";
import { Folder } from "../models/folderSetGet.model";
import { debounceTime, filter, map, mergeMap, switchMap, tap } from "rxjs/operators";
import scrollIntoView from "scroll-into-view-if-needed";

@Injectable({ providedIn: 'root' })
export class FolderStoreService {


    constructor(private ngZone: NgZone) {
        (window as any).api.receive('set-folder', (event, args: Folder) => {
            if (args.target === 'source') {
                this.ngZone.run(() => this._folder$.next(args.path));
            }
            if (args.target === 'target') {
                this.ngZone.run(() => this._targetFolder$.next(args.path));
            }
        });

        (window as any).api.receive('set-files', (event, args) => {
            console.log(args)
            if (this.activeFileIndex !== undefined) {
                args.files[this.activeFileIndex].active = true;
            }

            args.files.map((file, index, arr) => {
                file.stats.datebreak = false;
                file.stats.tempDay = Math.trunc(file.stats.ctimeMs / 86400000);
                if (index > 0 && arr[index - 1].stats.tempDay !== file.stats.tempDay) {
                    file.stats.datebreak = true;
                }
            });

            console.log(args.files)

            this.ngZone.run(() => this._files$.next(args.files));
        });

        this._files$.pipe(debounceTime(750),
            map((pic) => pic.filter((pic) => pic.active)[0]),
            filter((pic) => pic !== undefined && this._lastFileRequested$.value !== pic.name))
            .subscribe((pic) => {
                if (pic !== undefined && pic !== null) {
                    (window as any).api.send('load-pic', { pic: pic, fullres: true });
                    this._lastFileRequested$.next(pic.name);
                }
            })

        /**(window as any).api.receive('set-pic', (event, {data, type, name}) => {
            this.ngZone.run(() => {
                if(name === this.activeFile.name) {
                 this._pendingLoad$.next(false);
                }
            });
        });**/
    }

    private _folder$ = new BehaviorSubject<string>('');
    private _files$ = new BehaviorSubject<Picture[]>([]);
    private _targetFolder$ = new BehaviorSubject<string>('');
    private _lastFileRequested$ = new BehaviorSubject<string>('');
    private activeFileIndex: number;
    private _pendingLoad$ = new BehaviorSubject<boolean>(false);


    get folder$(): Observable<string> {
        return this._folder$.asObservable();
    }

    get targetFolder$(): Observable<string> {
        return this._targetFolder$.asObservable();
    }

    get files$(): Observable<Picture[]> {
        return this._files$.asObservable();
    }

    get activeFile(): Picture {
        return this._files$.value[this.activeFileIndex];
    }

    get isLoading$(): Observable<boolean> {
        return this._pendingLoad$.asObservable();
    }


    loadPic(event: any, pic: Picture) {
        if(event.ctrlKey) {
            (window as any).api.send('load-additional-pic', { "pic": pic, "fullres": true });
        } else {
            (window as any).api.send('load-pic', { "pic": pic, "fullres": true });
        }
        this._lastFileRequested$.next(pic.name);
        this._pendingLoad$.next(true);
        // Store old Array
        const picArray = this._files$.value;
        // Bisheriges Pic auf not active setzten
        if (this.activeFileIndex !== undefined) {
            picArray[this.activeFileIndex].active = false;
        }
        // Aktiv Setzten und Propagieren
        this.activeFileIndex = picArray.findIndex((pic2) => {
            return pic.name === pic2.name;
        });
        picArray[this.activeFileIndex].active = true;
        this._files$.next(picArray);
    }

    loadnextPic() {
        const picArray = this._files$.value;
        if (this.activeFileIndex !== undefined && this.activeFileIndex !== picArray.length - 1) {
            // Aktiv Setzten und Propagieren
            picArray[this.activeFileIndex].active = false;
            picArray[this.activeFileIndex + 1].active = true;
            this.activeFileIndex = this.activeFileIndex + 1;
            this._files$.next(picArray);

            const node = document.getElementById(picArray[this.activeFileIndex].name);
            scrollIntoView(node, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }

    loadprevPic() {
        const picArray = this._files$.value;
        if (this.activeFileIndex !== undefined && this.activeFileIndex !== 0) {
            // Aktiv Setzten und Propagieren
            picArray[this.activeFileIndex].active = false;
            picArray[this.activeFileIndex - 1].active = true;
            this.activeFileIndex = this.activeFileIndex - 1;
            this._files$.next(picArray);

            const node = document.getElementById(picArray[this.activeFileIndex].name);
            scrollIntoView(node, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }

    chooseFolder(target: string) {
        (window as any).api.send('get-folder', new Folder(target, ''));
        if (target === "source") {
            this._folder$.next('');
            this._files$.next([]);
        }
        if (target === "target") {
            this._targetFolder$.next('');
        }
    }

    finishedLoading() {
        this._pendingLoad$.next(false);
    }
}
