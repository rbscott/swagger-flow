import yaml from 'js-yaml';

import parse from '../src/parser';

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
      expect(parse(input).items).toMatchSnapshot();
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
      expect(parse(input).items).toMatchSnapshot();
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
      expect(parse(input).items).toMatchSnapshot();
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
      expect(parse(input).items).toMatchSnapshot();
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
      expect(parse(input).items).toMatchSnapshot();
    });

  });
});
