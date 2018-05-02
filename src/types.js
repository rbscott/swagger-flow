// @flow

type FieldBase = {|
  name: string,

  // Unique identifier used to resolve references.
  id: string,
|};

export type SwaggerArray = {|
  items: ?(Field),
  type: 'array',
  ...FieldBase,
|};

// allOf is similar to the insection type in Flow.
// anyOf is similar to the union type in Flow.
// oneOf is similar to the union type in Flow. It isn't exactly the
// same thing because oneOf must match exactly one schema and not
// multiple schemas.
export type SwaggerComplexType = {|
  choices: Array<Field>,
  required: Array<string>,
  type: ('anyOf' | 'allOf' | 'oneOf'),
  ...FieldBase,
|};

export type SwaggerEnum = {|
  values: Array<string>,
  type: 'enum',
  ...FieldBase,
|};

export type SwaggerObject = {|
  additionalProperties: ?(boolean | Field),
  fields: Map<string, Field>,
  required: Array<string>,
  type: 'object',
  ...FieldBase,
|};

export type SwaggerPrimitive = {|
  // There are some refinements that could happen here such as regular expressions,
  // etc, but for now just keep it simple.
  type: (
    'boolean' |
    'integer' |
    'string'
  ),
  ...FieldBase,
|};

export type SwaggerReference = {|
  // There are some refinements that could happen here such as regular expressions,
  // etc, but for now just keep it simple.
  type: 'ref',
  ref: string,
  ...FieldBase,
|};


export type Field = (
  SwaggerArray |
  SwaggerComplexType |
  SwaggerEnum |
  SwaggerObject |
  SwaggerPrimitive |
  SwaggerReference
);

export type Schema = {|
  items: Array<Field>,
|};

export const PRIMITIVE_TYPE_BOOLEAN = 'boolean';
export const PRIMITIVE_TYPE_INTEGER = 'integer';
export const PRIMITIVE_TYPE_NUMBER = 'number';
export const PRIMITIVE_TYPE_STRING = 'string';

export const PRIMITIVE_TYPES = [
  PRIMITIVE_TYPE_BOOLEAN,
  PRIMITIVE_TYPE_INTEGER,
  PRIMITIVE_TYPE_NUMBER,
  PRIMITIVE_TYPE_STRING,
];
