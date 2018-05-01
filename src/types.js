// @flow

type FieldBase = {|
  name: string,

  // Unique identifier used to resolve references.
  id: string,
|};

export type SwaggerArray = {|
  items: ?(Field | Array<Field>),
  additionalItems: ?(boolean | Field),
  type: 'array',
  ...FieldBase,
|};

export type SwaggerEnum = {|
  values: Array<string>,
  type: 'enum',
  ...FieldBase,
|};

export type SwaggerObject = {|
  fields: Array<Field>,
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

export type Field = (
  SwaggerEnum |
  SwaggerObject |
  SwaggerPrimitive |
  SwaggerArray
);

export type Schema = {|
  items: Array<Field>,
  lookupTable: Map<string, Field>,
|};

// Not sure if this will ever be necessary.
export type Definition = ({|
  type: 'schema',
  schema: Schema
|} | {|
  type: 'field',
  field: Field
|});

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
