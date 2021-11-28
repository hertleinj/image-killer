import { Picture } from './picture.model';

export class SessionState {
    fromFolder : string;
    toFolder : string;
    files : Picture[];
    activeFile : Picture;
}