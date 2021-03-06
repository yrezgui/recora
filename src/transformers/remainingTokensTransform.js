// @flow
import { keys } from 'lodash/fp';
import Color from 'color-forge';
import type { Token } from '../modules/tokenizer/types';
import { Pattern, CaptureOptions } from '../modules/patternMatcher';
import type { Transformer, TokenNode } from '../modules/transformer/types';
import { baseColor, baseDateTime, baseFunction, baseEntity } from '../modules/math/types';
import type { Node, ColorNode, DateTimeNode, DateTime } from '../modules/math/types'; // eslint-disable-line
import { FUNCTION_EXPONENT } from '../modules/math/functions';
import { TOKEN_COLOR, TOKEN_DATE_TIME, TOKEN_CONSTANT } from '../tokenTypes';
import { evenIndexElements, oddIndexElements, mapUnlessNull, flatZip, uncastArray } from '../util';


const transforms = {
  [TOKEN_COLOR]: (token: Token): ColorNode => {
    const { values, alpha, space } = Color.hex(token.value);
    return { ...baseColor, values, alpha, space };
  },
  [TOKEN_DATE_TIME]: (token: Token): ?DateTimeNode => {
    const { directionHint, value } = token.value;
    if (!value) return null;
    return { ...baseDateTime, value, directionHint };
  },
  [TOKEN_CONSTANT]: (token: Token): ?Node => {
    const { value, power } = token.value;
    if (!value) return null;
    if (power === 1) return value;
    const powerEntity = { ...baseEntity, quantity: power };
    return { ...baseFunction, name: FUNCTION_EXPONENT, args: [value, powerEntity] };
  },
};
const transformTokens = keys(transforms);

const remainingTokensTransform: Transformer = {
  pattern: new Pattern([
    new CaptureOptions(transformTokens).negate().lazy().any(),
    new Pattern([
      new CaptureOptions(transformTokens),
      new CaptureOptions(transformTokens).negate().lazy().any(),
    ]).oneOrMore(),
  ]),
  transform: (captureGroups, transform) => transform(evenIndexElements(captureGroups), segments => {
    const remainingTokenSegments = mapUnlessNull(element => {
      const token: Token = element[0];
      return transforms[token.type](token);
    }, oddIndexElements(captureGroups));

    if (!remainingTokenSegments) return null;

    const remainingTokens: TokenNode[] = flatZip(segments, remainingTokenSegments);
    return uncastArray(remainingTokens);
  }),
};
export default remainingTokensTransform;
