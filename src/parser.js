// @flow

import type {
  Definition,
  Field,
  Schema,
  SwaggerArray,
  SwaggerEnum,
  SwaggerObject,
  SwaggerPrimitive,
} from './types';

/**
 * Parser: Convert a Schema Definition from YAML or JSON into a Schema object
 */

const parse = (schema: Object): Definition => {
  return {
   type: 'field',
   field:  {
      name: 'name',
      id: 'id',
      type: 'string',
   },
  };
};

export default parse;
