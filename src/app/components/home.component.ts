import { Component, OnInit, NgZone } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FolderStoreService } from '../services/folder-store.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PicStoreService } from '../services/pic-store.service';

@Component({
  selector: 'div[image-view]',
  template: `
    <div *ngIf='picSet' class="flex flex-row flex-wrap z-0" >
      <pinch-zoom *ngFor="let pic of picSrc | async" class="flex-1">
        <img [src]="pic.data" class="contain"/>
        <div class="z-10 absolute bottom-0 px-6 pt-2 rounded-t-2xl bg-gray-800 bg-opacity-75">{{pic.name}}</div>
      </pinch-zoom>
    </div>
    <div *ngIf="!picSet" class="bg-gray-700 w-3/5 mx-auto rounded-lg border border-gray-800 p-6 lg:py-8 lg:px-14 text-gray-300">
    <div   class="text-white w-full flex relative shadow-sm justify-start mb-10 border-b-2 border-gray-100 border-opacity-20">
      <div class="mr-4 flex-shrink-0 my-auto">
        <svg class="fill-current w-8 h-8" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
            <path  d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
        </svg>
      </div>
      <div class="flex-auto my-2 text-2xl font-bold">
        <span>Keyboard Actions</span>
      </div>
    </div>
    <div class="w-full grid grid-cols-2 gap-y-2 ">
      <div class="text-lg font-medium">
        <div>Show Image</div>
      </div>
      <div class="text-lg font-medium text-center justify-self-end">
        <div>Click</div>
      </div>
      <div class="text-lg font-medium flex ">
        <div class="m-auto ml-0">Datei kopieren</div>
      </div>
      <div class="text-lg font-medium text-center justify-self-end flex align-middle">
        <div class="m-auto ml-0">Press</div><div class="border-gray-100 border-opacity-30 border border-b-2 rounded-lg py-1 px-3 ml-2">C</div>
      </div>
      <div class="text-lg font-medium flex">
        <div class="m-auto ml-0">Compare Image to Current</div>
      </div>
      <div class="text-lg font-medium text-center justify-self-end flex">
        <div class="m-auto ml-0">Hold </div>
        <div class="border-gray-100 border-opacity-30 border border-b-2 rounded-lg py-1 px-3 mx-2">Strg</div>
        <div class="m-auto ml-0"> + Click</div>
      </div>
      <div class="text-lg font-medium flex">
        <div class="m-auto ml-0">Show next image</div>
      </div>
      <div class="text-lg font-medium text-center justify-self-end flex">
        <div class="m-auto ml-0">Press</div>
        <div class="border-gray-100 border-opacity-30 border border-b-2 rounded-lg py-2 px-3 mx-2">
          <svg  class="fill-current w-5 h-5" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M4,10V14H13L9.5,17.5L11.92,19.92L19.84,12L11.92,4.08L9.5,6.5L13,10H4Z" />
          </svg>
        </div>
      </div>
      <div class="text-lg font-medium flex">
        <div class="m-auto ml-0">Show previous image</div>
      </div>
      <div class="text-lg font-medium text-center justify-self-end flex">
        <div class="m-auto ml-0">Press</div>
        <div class="border-gray-100 border-opacity-30 border border-b-2 rounded-lg py-2 px-3 mx-2">
          <svg  class="fill-current w-5 h-5" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M20,10V14H11L14.5,17.5L12.08,19.92L4.16,12L12.08,4.08L14.5,6.5L11,10H20Z" />
          </svg>
        </div>
      </div>
    </div>

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
    this.folderstore.folder$.subscribe( (o : string) => {
      this.picSrc.next([]);
      this.picSet = false;
    })
  }

  ngOnInit() {
    (window as any).api.receive('set-pic', (event, arg) => {
      this._ngZone.run(() => {
        if (arg.name === this.folderstore.activeFile.name) {
          this.picSrc.next([{ name: arg.name, data: this.sanitizer.bypassSecurityTrustResourceUrl("data:image/" + arg.type + ";base64," + arg.data) }]);
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
          if (test.length === 2) {
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
