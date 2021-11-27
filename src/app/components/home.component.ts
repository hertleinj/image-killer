import { Component, OnInit, NgZone } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FolderStoreService } from '../services/folder-store.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PicStoreService } from '../services/pic-store.service';

@Component({
  selector: 'div[image-view]',
  template: `
    <div *ngIf='picSet' class="flex flex-row flex-wrap" >
      <pinch-zoom *ngFor="let pic of picSrc | async" class="flex-1">
        <img [src]="pic" class="contain"/>
      </pinch-zoom>
    </div>
    `,
  styles: [`
    :host {
        flex: 5;
        padding: 0;
        margin: 0;
        list-style: none;
        display: flex;
        align-items: center;
        justify-content: center;
        max-height: 100%;
    }
    pinch-zoom {
        width: 100%;
    }
    img {
        max-height: 100vh !important;
    }`]
})

export class HomeComponent implements OnInit {
  picSrc: BehaviorSubject<Array<SafeResourceUrl>> = new BehaviorSubject([]);
  picSet: Boolean = false;

  constructor(private _ngZone: NgZone, private sanitizer: DomSanitizer, public folderstore: FolderStoreService, private picStore: PicStoreService) {
  }

  ngOnInit() {
    (window as any).api.receive('set-pic', (event, arg) => {
      this._ngZone.run(() => {
        if (arg.name === this.folderstore.activeFile.name) {
          this.picSrc.next([this.sanitizer.bypassSecurityTrustResourceUrl("data:image/" + arg.type + ";base64," + arg.data)]);
          this.picSet = true;
        }
        this.picStore.updateCurrentPic(arg);
        this.folderstore.finishedLoading();
      });
    });

    (window as any).api.receive('add-pic', (event, arg) => {
      this._ngZone.run(() => {
        if (arg.name === this.folderstore.activeFile.name) {
          let test = this.picSrc.value;
          if(test.length === 2){
            test = [test[1]]
          }
          test.push(this.sanitizer.bypassSecurityTrustResourceUrl("data:image/" + arg.type + ";base64," + arg.data))
          this.picSrc.next(test);
          this.picSet = true;
        }
        this.picStore.updateCurrentPic(arg);
        this.folderstore.finishedLoading();
      });
    });
  }
}
