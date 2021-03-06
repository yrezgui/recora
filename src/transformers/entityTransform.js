// @flow
import { last, reduce, update, concat, set, some } from 'lodash/fp';
import { combineUnits } from '../modules/math/types/entity';
import { Pattern, CaptureOptions } from '../modules/patternMatcher';
import type { Transformer, TokenNode } from '../modules/transformer/types';
import {
  TOKEN_NUMBER, TOKEN_UNIT_NAME, TOKEN_UNIT_PREFIX, TOKEN_UNIT_SUFFIX,
} from '../tokenTypes';
import { baseEntity } from '../modules/math/types';
import type { Units, EntityNode } from '../modules/math/types'; // eslint-disable-line
import { INTERMEDIATE_UNIT, combineUnitNamesPrefixesSuffixes } from './util';
import { evenIndexElements, oddIndexElements, mapUnlessNull, flatZip, uncastArray } from '../util';


const getEntities = (segment: TokenNode[]): ?(EntityNode[]) => {
  const segmentWithIntermediateUnits = combineUnitNamesPrefixesSuffixes(segment);
  if (segmentWithIntermediateUnits === null) return null;

  /*
  Combine all units and numbers into entities. Examples of algorithm below:
  number unit1
    => [Entity(number unit1)]
  unit1 number
    => [Entity(number unit1)]
  number unit1 unit2
    => [Entity(number unit1 unit2)]
  number1 unit1 number1 unit2
    => [Entity(number1 unit1), Entity(number2 unit2)]
  unit1 number1 unit2 number2 unit3
    => [Entity(number1 unit1 unit2), Entity(number2 unit3)]
  */
  const baseEntityValue = { ...baseEntity, quantity: undefined };
  const maybeEntities = reduce((accum, tag) => {
    if (tag.type === INTERMEDIATE_UNIT) {
      const unit: Units = { [tag.name]: tag.power };
      return update([accum.length - 1, 'units'], combineUnits(unit), accum);
    } else if (tag.type === TOKEN_NUMBER && last(accum).quantity === undefined) {
      return set([accum.length - 1, 'quantity'], tag.value, accum);
    } else if (tag.type === TOKEN_NUMBER) {
      const newEntityValue = set('quantity', tag.value, baseEntityValue);
      return concat(accum, newEntityValue);
    }
    return accum;
  }, [baseEntityValue], segmentWithIntermediateUnits);

  if (some(entity => entity.quantity === undefined, maybeEntities)) return null;

  const entities: EntityNode[] = maybeEntities;
  return entities;
};

const unitParts = [TOKEN_NUMBER, TOKEN_UNIT_NAME, TOKEN_UNIT_PREFIX, TOKEN_UNIT_SUFFIX];

const entityTransform: Transformer = {
  pattern: new Pattern([
    new CaptureOptions(unitParts).negate().lazy().any(),
    new Pattern([
      new CaptureOptions(unitParts).lazy().oneOrMore(),
      new CaptureOptions(unitParts).negate().lazy().any(),
    ]).oneOrMore(),
  ]),
  transform: (captureGroups, transform) => transform(evenIndexElements(captureGroups), segments => {
    const unitSegments = mapUnlessNull(getEntities, oddIndexElements(captureGroups));
    if (!unitSegments) return null;

    const zippedSegments = flatZip(segments, unitSegments);
    return uncastArray(zippedSegments);
  }),
};
export default entityTransform;
