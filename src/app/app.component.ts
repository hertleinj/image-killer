import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { APP_CONFIG } from '../environments/environment';
import { Actions } from './models/Actions.model';
import { FolderStoreService } from './services/folder-store.service';

@Component({
  selector: 'app-root',
  template: `
  <hotkeys-cheatsheet title='Hotkeys 4 U'></hotkeys-cheatsheet>
  <as-split direction="horizontal">
    <as-split-area [size]="15" style="display: flex; flex-direction: column;">
    <div folder-view class="bg-gray-900  h-full"></div>
    </as-split-area>
    <as-split-area [size]="85" class="bg-gray-500">
    <div image-view class="bg-gray-500 h-full w-full"></div>
    </as-split-area>
  </as-split>
    <!-- <vaadin-progress-bar *ngIf='this.folderstoreService.isLoading$ | async' id='progressbar' indeterminate value='0'></vaadin-progress-bar>-->
  `,
  styles: [
    `
      vaadin-split-layout {
        height: 100%;
      }
      #progressbar {
        margin: 0px;
        z-index: 99;
        position: fixed;
        bottom: 0;
      }
    `
  ]
})
export class AppComponent {
  constructor(
    private translate: TranslateService,
    private _hotkeysService: HotkeysService,
    public folderstoreService: FolderStoreService
  ) {
    this._hotkeysService.add(
      new Hotkey(
        'right',
        (event: KeyboardEvent): boolean => {
          this.folderstoreService.loadnextPic();
          return false; // Prevent bubbling
        },
        undefined,
        'Next Picture',
        'keyup'
      )
    );

    this._hotkeysService.add(
      new Hotkey(
        'left',
        (event: KeyboardEvent): boolean => {
          this.folderstoreService.loadprevPic();
          return false; // Prevent bubbling
        },
        undefined,
        'Previous Picture',
        'keyup'
      )
    );

    this._hotkeysService.add(
      new Hotkey(
        'c',
        (event: KeyboardEvent): boolean => {
          (window as any).api.send('do-action', Actions.COPY);
          return false; // Prevent bubbling
        },
        undefined,
        'Copy Picture to Target'
      )
    );

    translate.setDefaultLang('en');
  }
}
