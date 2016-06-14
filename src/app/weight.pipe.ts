import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'weight'
})
export class Weight implements PipeTransform {

  transform(valueString: number): string {
    if (!valueString)
      return null;
    
    let value = +valueString;
    if (isNaN(value))
      return "Invalid value";

    if (value < 1000)
      return value.toFixed(0) + "g";

    if (value < 1000000)
      return (value/1000).toFixed(1) + "kg";

    return (value/1000000).toFixed(1) + "t";
  }

}
