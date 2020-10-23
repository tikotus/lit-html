/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {
  AttributePart,
  Directive,
  directive,
  Part,
  PartInfo,
  nothing,
} from '../lit-html.js';
import {setPartValue} from '../parts.js';

class UntilDirective extends Directive {
  private _index: undefined | number;
  private _latestUpdateId: number;

  constructor(_part: PartInfo, index?: number) {
    super();

    this._index = index;
    this._latestUpdateId = 0;
  }

  render(...values: Array<unknown>) {
    return values.find((value) => !(value instanceof Promise)) ?? nothing;
  }

  update(part: Part, values: Array<unknown>) {
    const updateId = ++this._latestUpdateId;
    let lastRenderedIndex = Infinity;

    for (let i = 0; i < values.length; i++) {
      const index = i;
      const value = values[i];

      if (value instanceof Promise) {
        value.then((result) => {
          if (updateId === this._latestUpdateId && index < lastRenderedIndex) {
            lastRenderedIndex = index;
            if ((part as AttributePart).strings !== undefined) {
              setPartValue(part, result, this._index as number);
            } else {
              setPartValue(part, result);
            }
          }
        });
      }
    }

    return this.render(...values);
  }
}

export const until = directive(UntilDirective);
