import yaml from 'js-yaml';

import parse from '../src/parser';
import {
  DEFAULT_PARSER_CONFIG,
  INLINE_PARSER_CONFIG,
} from './constants';

describe('parse', () => {
  describe('parameters', () => {
    it('Should parse a basic parameter', () => {
      const input = yaml.safeLoad(`
paths:
  /simple/test:
    get:
      parameters:
      - name: param1
        in: query
        type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse multiple parameters', () => {
      const input = yaml.safeLoad(`
paths:
  /simple/test:
    get:
      parameters:
      - name: param1
        in: query
        type: string
      - name: param2
        in: query
        type: boolean
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse global parameters', () => {
      const input = yaml.safeLoad(`
parameters:
- name: globalParam1
  in: query
  type: string

paths:
  /simple/test:
    get:
      parameters:
      - name: param1
        in: query
        type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse path parameters', () => {
      const input = yaml.safeLoad(`
paths:
  /simple/test:
    parameters:
    - name: pathParam1
      in: query
      type: string
    get:
      parameters:
      - name: param1
        in: query
        type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should inherit properly', () => {
      const input = yaml.safeLoad(`
parameters:
- name: sameParam
  in: query
  type: string

paths:
  /simple/test:
    parameters:
    - name: sameParam
      in: query
      type: boolean
    get:
      parameters:
      - name: sameParam
        in: query
        type: number
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should use the operationId without a controller', () => {
      const input = yaml.safeLoad(`
parameters:
paths:
  /simple/test:
    parameters:
    - name: sameParam
      in: query
      type: boolean
    get:
      operationId: Operation
      parameters:
      - name: sameParam
        in: query
        type: number
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should use the operationId with a path controller', () => {
      const input = yaml.safeLoad(`
parameters:
paths:
  /simple/test:
    x-flow-controller: Controller
    parameters:
    - name: sameParam
      in: query
      type: boolean
    get:
      operationId: Operation
      parameters:
      - name: sameParam
        in: query
        type: number
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should use the operationId with a method controller', () => {
      const input = yaml.safeLoad(`
parameters:
paths:
  /simple/test:
    x-flow-controller: Controller
    parameters:
    - name: sameParam
      in: query
      type: boolean
    get:
      x-flow-controller: Method
      operationId: Operation
      parameters:
      - name: sameParam
        in: query
        type: number
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should split out the body if requested.', () => {
      const input = yaml.safeLoad(`
parameters:
paths:
  /simple/test:
    get:
      parameters:
      - name: body
        in: body
        type: number
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should split out the body with a rich schema.', () => {
      const input = yaml.safeLoad(`
parameters:
paths:
  /simple/test:
    get:
      parameters:
      - name: body
        in: body
        schema:
          type: object
          properties:
            - name: param1
              type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should inline body if requested.', () => {
      const input = yaml.safeLoad(`
parameters:
paths:
  /simple/test:
    get:
      parameters:
      - name: body
        in: body
        type: number
`);
      expect(parse(input, INLINE_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should inline the body with a rich schema.', () => {
      const input = yaml.safeLoad(`
parameters:
paths:
  /simple/test:
    get:
      parameters:
      - name: body
        in: body
        schema:
          type: object
          properties:
            - name: param1
              type: string
`);
      expect(parse(input, INLINE_PARSER_CONFIG).items).toMatchSnapshot();
    });
  });

  describe('response', () => {
    it('Should parse a basic response', () => {
      const input = yaml.safeLoad(`
paths:
  /simple/test:
    get:
      responses:
        200:
          schema:
            type: object
            properties:
              resp1:
                type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse an operationId without a controller', () => {
      const input = yaml.safeLoad(`
paths:
  /simple/test:
    get:
      operationId: Operation
      responses:
        200:
          schema:
            type: object
            properties:
              resp1:
                type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse an operationId with a path controller', () => {
      const input = yaml.safeLoad(`
paths:
  /simple/test:
    x-flow-controller: Controller
    get:
      operationId: Operation
      responses:
        200:
          schema:
            type: object
            properties:
              resp1:
                type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse an operationId with a method controller', () => {
      const input = yaml.safeLoad(`
paths:
  /simple/test:
    x-flow-controller: Controller
    get:
      x-flow-controller: Method
      operationId: Operation
      responses:
        200:
          schema:
            type: object
            properties:
              resp1:
                type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });


  });

});
