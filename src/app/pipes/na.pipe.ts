import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'na'
})
export class NaPipe implements PipeTransform {

  transform(value: string): string {
    if (!value || value.length == 0)
      return 'N/A';
    return value;
  }

}
