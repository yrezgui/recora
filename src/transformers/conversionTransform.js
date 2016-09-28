// @flow
import {
  __, flow, take, takeRight, takeWhile, takeRightWhile, drop, dropRight, dropWhile, dropRightWhile,
  isEmpty, map, includes, last, filter, reduce, set, first,
} from 'lodash/fp';
import type { Transformer } from '../modules/transformer/types';
import {
  TOKEN_NOOP,
  TOKEN_UNIT_NAME,
  TOKEN_UNIT_PREFIX,
  TOKEN_UNIT_SUFFIX,
  TOKEN_NUMBER,
  TOKEN_FORMATTING_HINT,
  TOKEN_VIRTUAL_UNIT,
} from '../tokenTypes';
import { baseConversion } from '../modules/math/types';
import { INTERMEDIATE_UNIT, combineUnitNamesPrefixesSuffixes } from './util';

const conversionTokens = [
  TOKEN_NOOP,
  TOKEN_UNIT_NAME,
  TOKEN_UNIT_PREFIX,
  TOKEN_UNIT_SUFFIX,
  TOKEN_FORMATTING_HINT,
  TOKEN_VIRTUAL_UNIT,
];
const unitTokens = [
  TOKEN_UNIT_NAME,
  TOKEN_UNIT_PREFIX,
  TOKEN_UNIT_SUFFIX,
];
const isNoop = type => type === TOKEN_NOOP;
const notNoop = type => type !== TOKEN_NOOP;
const isConversionToken = includes(__, conversionTokens);

const findLeftConversion = tags => {
  const tagTypes = map('type', tags);

  const conversionTagTypes = flow(
    takeWhile(isConversionToken),
    dropRightWhile(notNoop),
    dropWhile(isNoop)
  )(tagTypes);

  if (isEmpty(conversionTagTypes) || last(conversionTagTypes) !== TOKEN_NOOP) return null;

  const index = conversionTagTypes.length;
  const conversionTags = take(index, tags);
  const remainingTags = drop(index, tags);
  return [remainingTags, conversionTags];
};

const findRightConversion = tags => {
  const tagTypes = map('type', tags);

  let conversionTagTypes = takeRightWhile(isConversionToken, tagTypes);

  const precedingTag = tags[tags.length - conversionTagTypes.length - 1];

  if (precedingTag && (precedingTag.type === TOKEN_NUMBER)) {
    // Gathered too many tags and went into tags that would form an entity, drop some tags
    conversionTagTypes = dropWhile(notNoop, conversionTagTypes);
  }

  if (isEmpty(conversionTagTypes)) return null;

  const index = conversionTagTypes.length;
  const conversionTags = takeRight(index, tags);
  const remainingTags = dropRight(index, tags);
  return [remainingTags, conversionTags];
};

const findConversion = tags => findLeftConversion(tags) || findRightConversion(tags);


const conversionsTransform: Transformer = {
  pattern: { match: findConversion },
  transform: (captureGroups, transform) => transform([captureGroups[0]], ([value]) => {
    const conversionSegment = captureGroups[1];

    const virtualConversions = filter({ type: TOKEN_VIRTUAL_UNIT }, conversionSegment);
    if (virtualConversions.length > 1) return null;

    const unitSegmentWithIntermediateUnits = flow(
      filter(token => includes(token.type, unitTokens)),
      combineUnitNamesPrefixesSuffixes
    )(conversionSegment);
    if (!unitSegmentWithIntermediateUnits) return null;

    const entityConversion = flow(
      filter({ type: INTERMEDIATE_UNIT }),
      map(unit => ({ [unit.name]: unit.power }))
    )(unitSegmentWithIntermediateUnits);

    const virtualConversion = first(virtualConversions.value) || null;

    const formatting = flow(
      filter({ type: TOKEN_FORMATTING_HINT }),
      map('value'),
      reduce((accum, { key, value }) => set(key, value, accum), {})
    )(conversionSegment);

    return { ...baseConversion, value, entityConversion, virtualConversion, formatting };
  }),
};
export default conversionsTransform;
