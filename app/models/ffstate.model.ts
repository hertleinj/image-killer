import { Picture } from './picture.model';

export class FFState {
    fromFolder : string;
    toFolder : string;
    files : Picture[];
    activeFile : Picture;
}