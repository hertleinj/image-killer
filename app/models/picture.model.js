"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFilePathForOne = exports.generateFilePath = exports.Picture = void 0;
var Picture = /** @class */ (function () {
    function Picture(name, type, folder) {
        this.name = name;
        this.types = [];
        this.types.push(type);
        this.folder = folder;
        this.active = false;
        this.copiedTypes = [];
    }
    return Picture;
}());
exports.Picture = Picture;
function generateFilePath(pic, type) {
    var path;
    if (type !== undefined && type.length !== 0) {
        type.forEach(function (element) {
            if (pic.types.includes(element)) {
                path = generateFilePathForOne(pic.folder, pic.name, element);
            }
        });
    }
    else if (path === undefined) {
        if (pic.types.includes("png") || pic.types.includes("PNG")) {
            generateFilePathForOne(pic.folder, pic.name, "png");
        }
        else if (pic.types.includes("jpg") || pic.types.includes("JPG")) {
            path = generateFilePathForOne(pic.folder, pic.name, "jpg");
        }
        else if (pic.types.length != 0) {
            path = generateFilePathForOne(pic.folder, pic.name, pic.types[0]);
        }
    }
    return path;
}
exports.generateFilePath = generateFilePath;
function generateFilePathForOne(folder, fileName, type) {
    return folder + "\\" + fileName + "." + type;
}
exports.generateFilePathForOne = generateFilePathForOne;
//# sourceMappingURL=picture.model.js.map