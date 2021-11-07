export class Picture {
    folder: string;
    name: string;
    types: string[];
    transfered: string[];
    buffered: boolean;
    active: boolean;
    bufferedUri: string;
    copiedTypes: string[];
    stats: any; // File Stats & Frontend stats.datebreak == true & stats.date

    constructor(name: string, type: string, folder: string) {
        this.name = name
        this.types = []
        this.types.push(type)
        this.folder = folder
        this.active = false
        this.copiedTypes = []
    }
}

export function generateFilePath(pic: Picture, type?: string[]): string {
    let path: string
    if (type !== undefined && type.length !== 0) {
        type.forEach(element => {
            if (pic.types.includes(element)) {
                path = generateFilePathForOne(pic.folder, pic.name, element);
            }
        });
    } else if (path === undefined) {
        if (pic.types.includes("png") || pic.types.includes("PNG")) {
            generateFilePathForOne(pic.folder, pic.name, "png")
        } else if (pic.types.includes("jpg") || pic.types.includes("JPG")) {
            path = generateFilePathForOne(pic.folder, pic.name, "jpg")
        } else if (pic.types.length != 0) {
            path = generateFilePathForOne(pic.folder, pic.name, pic.types[0])
        }
    }
    return path
}

export function generateFilePathForOne(folder: string, fileName: string, type: string): string {
    return folder + "\\" + fileName + "." + type
}