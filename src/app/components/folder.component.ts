import { Component, OnInit, ViewChild } from "@angular/core";
import { FolderStoreService } from "../services/folder-store.service";
import { map, tap, debounceTime } from "rxjs/operators";
import { Observable, from, of, combineLatest } from "rxjs";

@Component({
  selector: "div[folder-view]",
  template: `
      <div class="">
        <div>
          <div class="text-white p-4 w-full flex relative shadow-sm justify-start bg-gray-800 border-b-2 border-gray-700 cursor-pointer"
              *ngIf="folderSet$ | async; else noFolder"
              (click)="this.folderstore.chooseFolder('source')">
            <div class="mr-4 flex-shrink-0 my-auto">
              <svg class="fill-current w-5 h-5" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 4c0-1.1.9-2 2-2h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z"></path></svg>
            </div>
            <div class="flex-auto my-2">{{ this.folderstore.folder$ | async | truncate: true }}</div>
          </div>
          <ng-template #noFolder>
            <div
              type="button"
              (click)="this.folderstore.chooseFolder('source')"
              class="text-white p-4 w-full flex relative shadow-sm justify-start bg-gray-800 border-b-2 border-gray-700 cursor-pointer">
              <div class="mr-4 flex-shrink-0 my-auto">
                <svg class="fill-current w-5 h-5" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 4c0-1.1.9-2 2-2h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z"></path></svg>
              </div>
              <div class="flex-auto my-2">
                <span>Quell-Verzeichnis</span>
              </div>
            </div>
          </ng-template>
          <div class="text-white p-4 w-full flex relative shadow-sm justify-start bg-gray-800 border-b-2 border-gray-700 cursor-pointer"
              *ngIf="targetSet$ | async; else noFolderTarget"
              (click)="this.folderstore.chooseFolder('target')">
            <div class="mr-4 flex-shrink-0 my-auto">
              <svg class="fill-current w-5 h-5" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 4c0-1.1.9-2 2-2h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z"></path></svg>
            </div>
            <div class="flex-auto my-2">{{this.folderstore.targetFolder$ | async | truncate: true }}</div>
          </div>
          <ng-template #noFolderTarget>
            <div
            type="button" (click)="this.folderstore.chooseFolder('target')"
            class="text-white p-4 w-full flex relative shadow-sm justify-start bg-gray-800 border-b-2 border-gray-700 cursor-pointer">
              <div class="mr-4 flex-shrink-0 my-auto">
                <svg class="fill-current w-5 h-5" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 4c0-1.1.9-2 2-2h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z"></path></svg>
              </div>
              <div class="flex-auto my-2">
                <span>Ziel-Verzeichnis</span>
              </div>
            </div>
          </ng-template>
        </div>

        <div class="flex  justify-between text-center items-center  border-b-2 border-gray-800">
          <div class="ml-4 mb-2 self-center text-center pt-2 text-white font-semibold text-lg  ">
                Bilder
            </div>
        </div>
      </div>
      <div class="overflow-y-auto overflow-x-hidden flex-grow flex flex-col">
        <cdk-virtual-scroll-viewport itemSize="40" minBufferPx = "200" maxBufferPx = "250" class="flex-grow">
          <div
            *cdkVirtualFor="let file of this.folderstore.files$ | async ; index as i"
            (click)="this.folderstore.loadPic(file)"
            style="cursor: pointer;"
            [class.bg-gray-800]="file.active"
            [id]="file.name"
          >
            <div class="w-full">
              <div class="flex flex-wrap cursor-pointer my-1 hover:bg-gray-700 content-evenly">
                <div *ngIf="file.stats.datebreak || i == 0" class="w-full text-center pt-2">{{ file.stats.ctime.toLocaleDateString() }}</div>
                <div class="w-8 h-10 text-center py-1 text-blue-300">
                  <p class="text-3xl p-0 "
                  [class.text-green-300]="file.copiedTypes.length === file.types.length"
                  [class.text-yellow-300]="file.copiedTypes.length >= 1 &&  file.copiedTypes.length < file.types.length"
                  >&bull;</p>
                </div>
                <div class=" h-10 py-3 px-1 flex-grow">
                  <p class="text-blue-50">{{ file.name | truncate: false }}</p>
                </div>
                <div class="h-10 text-right p-3 flex flex-row">
                  <p *ngFor="let tag of file.types"
                    class="text-sm text-gray-50 mr-1">{{ tag | uppercase }}</p>
                </div>
              </div>
            </div>
          </div>
        </cdk-virtual-scroll-viewport>
    </div>
  `,
  styles: [
    `
      :host {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
      }
    `
  ]
})
export class FolderComponent implements OnInit {
  folderSet$: Observable<boolean>;
  targetSet$: Observable<boolean>;

  constructor(public folderstore: FolderStoreService) {
    this.folderSet$ = this.folderstore.folder$.pipe(
      map(folder => folder != "")
    );
    this.targetSet$ = this.folderstore.targetFolder$.pipe(
      map(folder => folder != "")
    );
  }

  ngOnInit() { }

  trackByFn(index, item) {
    return index;
  }
}
