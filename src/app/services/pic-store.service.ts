import { Injectable, NgZone } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Picture } from "../models/picture.model";

@Injectable({ providedIn: 'root' })
export class PicStoreService {

    constructor(private ngZone: NgZone) {
      /**   (window as any).api.receive('set-pic', (event, args) => {
            this.ngZone.run(() => this._pic$.next(args));
        })*/
    }

    private _pic$ = new BehaviorSubject<Picture>(undefined);


    get pic$(): Observable<Picture> {
        return this._pic$.asObservable();
    }

    updateCurrentPic(pic: Picture) {
        this._pic$.next(pic);
    }

    copyToFolder(pic: Picture, destination: string) {
        (window as any).api.send('copy-pic', {from: pic.folder + pic.name, to: destination})
    }
}