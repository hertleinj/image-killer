import { Component, OnInit, NgZone } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FolderStoreService } from '../services/folder-store.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PicStoreService } from '../services/pic-store.service';

@Component({
  selector: 'div[image-view]',
  template: `
    <div *ngIf='picSet'>
      <pinch-zoom>
        <img [src]="picSrc" class="contain"/>
      </pinch-zoom>
    </div>
    <!--<iron-icon *ngIf='!picSet' icon="vaadin:picture"></iron-icon>-->`,
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
  picSrc: SafeResourceUrl;
  picSet: Boolean = false;

  constructor(private _ngZone: NgZone, private sanitizer: DomSanitizer,public folderstore: FolderStoreService, private picStore: PicStoreService) {
  }

  ngOnInit() {
    (window as any).api.receive('set-pic', (event, arg) => {
      this._ngZone.run(() => {
        if(arg.name === this.folderstore.activeFile.name) {
        this.picSrc = this.sanitizer.bypassSecurityTrustResourceUrl("data:image/" + arg.type + ";base64," + arg.data);
        this.picSet = true;
        }
        this.picStore.updateCurrentPic(arg);
        this.folderstore.finishedLoading();
      });
    })
  }
}
