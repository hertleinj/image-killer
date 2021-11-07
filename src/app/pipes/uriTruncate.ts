import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class Truncate implements PipeTransform {
  transform(value: string, uri: boolean) {
    if (uri === true) {
      let limit = value.lastIndexOf('\\');
      return `...\\${value.substr(limit, value.length)}`;
    } else if (value.length > 20) {
      return `${value.substr(0, 20)}...` ;
    } 
    return value;
  }
}