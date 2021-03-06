// @flow
import { findIndex, last } from 'lodash/fp';
import type { ConversionDescriptors } from './modules/math/types';

const timeDimensions = { time: 1 };
const lengthDimensions = { length: 1 };
const massDimensions = { mass: 1 };
const areaDimensions = { length: 2 };
const volumeDimensions = { length: 3 };
const energyDimensions = { mass: 1, length: 2, time: -2 };
const powerDimensions = { mass: 1, length: 2, time: -3 };
const memoryDimensions = { memory: 1 };
const currencyDimensions = { currency: 1 };
const absoluteTemperatureDimensions = { absoluteTemperature: 1 };
const noDimensions = {};

const gasMarkToK =
  [380.35, 394.25, 408.15, 421.95, 435.85, 453.15, 463.65, 477.55, 491.45, 505.35, 519.25];
const kToGasMark =
  [0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// TODO: Copy from https://github.com/gentooboontoo/js-quantities/blob/master/src/quantities.js

/* eslint-disable quote-props, no-multi-spaces, indent, max-len */
const conversionDescriptors: ConversionDescriptors = {
               'second': [1,                             timeDimensions],
               'minute': [60,                            timeDimensions],
                 'hour': [3600,                          timeDimensions],
                  'day': [86400,                         timeDimensions],
              'weekday': [120960,                        timeDimensions],
                 'week': [604800,                        timeDimensions],
            'fortnight': [1209600,                       timeDimensions],
                'month': [2628000,                       timeDimensions],
                 'year': [31536000,                      timeDimensions],
               'decade': [315360000,                     timeDimensions],
              'century': [3155673600,                    timeDimensions],

                'meter': [1,                             lengthDimensions],
                 'inch': [0.0254,                        lengthDimensions],
                 'foot': [0.3048,                        lengthDimensions],
                 'yard': [0.9144,                        lengthDimensions],
                 'mile': [1609,                          lengthDimensions],
               'league': [4827,                          lengthDimensions],
               'fathom': [1.8288,                        lengthDimensions],
              'furlong': [201,                           lengthDimensions],
           'light year': [9.4605284e15,                  lengthDimensions],
               'parsec': [3.086e16,                      lengthDimensions],
             'angstrom': [1e-10,                         lengthDimensions],
        'nautical mile': [1852,                          lengthDimensions],

                 'gram': [1e-3,                          massDimensions],
                'tonne': [1e3,                           massDimensions],
                'ounce': [0.0283495,                     massDimensions],
                'pound': [0.453592,                      massDimensions],
                'stone': [6.35029,                       massDimensions],

                 'acre': [4047,                          areaDimensions],
              'hectare': [1e4,                           areaDimensions],

                'liter': [1e-3,                          volumeDimensions],
               'gallon': [4.54609e-3,                    volumeDimensions],
            'us gallon': [3.785e-3,                      volumeDimensions],
                'quart': [9.464e-4,                      volumeDimensions],
                  'cup': [2.4e-4,                        volumeDimensions],
               'US cup': [2.3559e-4,                     volumeDimensions],
             'teaspoon': [4.929e-6,                      volumeDimensions],
           'tablespoon': [1.479e-5,                      volumeDimensions],
                 'drop': [5e-8,                          volumeDimensions],
          'fluid ounce': [2.8413e-5,                     volumeDimensions],

                'Joule': [1,                             energyDimensions],
              'Calorie': [4.184,                         energyDimensions],
        'electron volt': [1.602e-19,                     energyDimensions],
                  'BTU': [1055,                          energyDimensions],
                'therm': [1055000000,                    energyDimensions],

                         // We also have absolute temperatures below
       'degrees Kelvin': [1.4e-23,                       energyDimensions],
      'degrees Celsius': [1.4e-23,                       energyDimensions],
   'degrees Fahrenheit': [7.7777777778e-23,              energyDimensions],
      'degrees Rankine': [7.7777777778e-23,              energyDimensions],

                 'Watt': [1,                             powerDimensions],

                  'bit': [1,                             memoryDimensions],
                 'byte': [8,                             memoryDimensions],

                  'AUD': [1,                             currencyDimensions],
                  'BGN': [1,                             currencyDimensions],
                  'BRL': [1,                             currencyDimensions],
                  'CAD': [1,                             currencyDimensions],
                  'CHF': [1,                             currencyDimensions],
                  'CNY': [1,                             currencyDimensions],
                  'CZK': [1,                             currencyDimensions],
                  'DKK': [1,                             currencyDimensions],
                  'EUR': [1,                             currencyDimensions],
                  'GBP': [1,                             currencyDimensions],
                  'HKD': [1,                             currencyDimensions],
                  'HRK': [1,                             currencyDimensions],
                  'HUF': [1,                             currencyDimensions],
                  'IDR': [1,                             currencyDimensions],
                  'ILS': [1,                             currencyDimensions],
                  'INR': [1,                             currencyDimensions],
                  'JPY': [1,                             currencyDimensions],
                  'KRW': [1,                             currencyDimensions],
                  'MXN': [1,                             currencyDimensions],
                  'MYR': [1,                             currencyDimensions],
                  'NOK': [1,                             currencyDimensions],
                  'NZD': [1,                             currencyDimensions],
                  'PHP': [1,                             currencyDimensions],
                  'PLN': [1,                             currencyDimensions],
                  'RON': [1,                             currencyDimensions],
                  'RUB': [1,                             currencyDimensions],
                  'SEK': [1,                             currencyDimensions],
                  'SGD': [1,                             currencyDimensions],
                  'THB': [1,                             currencyDimensions],
                  'TRY': [1,                             currencyDimensions],
                  'USD': [1,                             currencyDimensions],
                  'ZAR': [1,                             currencyDimensions],

          'femtosecond': [1e-15,                         timeDimensions],
           'picosecond': [1e-12,                         timeDimensions],
           'nanosecond': [1e-9,                          timeDimensions],
          'microsecond': [1e-6,                          timeDimensions],
          'millisecond': [1e-3,                          timeDimensions],

           'femtometer': [1e-15,                         lengthDimensions],
            'picometer': [1e-12,                         lengthDimensions],
            'nanometer': [1e-9,                          lengthDimensions],
           'micrometer': [1e-6,                          lengthDimensions],
           'millimeter': [1e-3,                          lengthDimensions],
           'centimeter': [1e-2,                          lengthDimensions],
            'kilometer': [1e3,                           lengthDimensions],
            'megameter': [1e6,                           lengthDimensions],
            'gigameter': [1e9,                           lengthDimensions],
            'terameter': [1e12,                          lengthDimensions],
            'petameter': [1e15,                          lengthDimensions],

            'femtogram': [1e-18,                         massDimensions],
             'picogram': [1e-15,                         massDimensions],
             'nanogram': [1e-12,                         massDimensions],
            'microgram': [1e-9,                          massDimensions],
            'milligram': [1e-6,                          massDimensions],
             'kilogram': [1,                             massDimensions],
             'megagram': [1e3,                           massDimensions],
             'gigagram': [1e6,                           massDimensions],
             'teragram': [1e9,                           massDimensions],
             'petagram': [1e12,                          massDimensions],

           'milliliter': [1e-6,                          volumeDimensions],
           'centiliter': [1e-5,                          volumeDimensions],

           'femtojoule': [1e-15,                         energyDimensions],
            'picojoule': [1e-12,                         energyDimensions],
            'nanojoule': [1e-9,                          energyDimensions],
           'microjoule': [1e-6,                          energyDimensions],
           'millijoule': [1e-3,                          energyDimensions],
           'centijoule': [1e-2,                          energyDimensions],
            'kilojoule': [1e3,                           energyDimensions],
            'megajoule': [1e6,                           energyDimensions],
            'gigajoule': [1e9,                           energyDimensions],
            'terajoule': [1e12,                          energyDimensions],
            'petajoule': [1e15,                          energyDimensions],

            'femtowatt': [1e-15,                         powerDimensions],
             'picowatt': [1e-12,                         powerDimensions],
             'nanowatt': [1e-9,                          powerDimensions],
            'microwatt': [1e-6,                          powerDimensions],
            'milliwatt': [1,                             powerDimensions],
             'kilowatt': [1e3,                           powerDimensions],
             'megawatt': [1e6,                           powerDimensions],
             'gigawatt': [1e9,                           powerDimensions],
             'terawatt': [1e12,                          powerDimensions],
             'petawatt': [1e15,                          powerDimensions],

              'kilobit': [1e3,                           memoryDimensions],
              'megabit': [1e6,                           memoryDimensions],
              'gigabit': [1e9,                           memoryDimensions],
              'terabit': [1e12,                          memoryDimensions],
              'petabit': [1e15,                          memoryDimensions],
              'kibibit': [1024,                          memoryDimensions],
              'mebibit': [1048576,                       memoryDimensions],
              'gibibit': [1073741824,                    memoryDimensions],
              'tebibit': [1099511627776,                 memoryDimensions],
              'pebibit': [1125899906842624,              memoryDimensions],

             'kilobyte': [8e3,                           memoryDimensions],
             'megabyte': [8e6,                           memoryDimensions],
             'gigabyte': [8e9,                           memoryDimensions],
             'terabyte': [8e12,                          memoryDimensions],
             'petabyte': [8e15,                          memoryDimensions],
             'kibibyte': [8192,                          memoryDimensions],
             'mebibyte': [8388608,                       memoryDimensions],
             'gibibyte': [8589934592,                    memoryDimensions],
             'tebibyte': [8796093022208,                 memoryDimensions],
             'pebibyte': [9007199254740992,              memoryDimensions],

              // 'percent': [0.01,                          noDimensions],
               'degree': [0.0174532925199432957692369,   noDimensions],
               'radian': [1,                             noDimensions],
            'arcminute': [0.000290888208665721596153948, noDimensions],
            'arcsecond': [4.848136811095359935899141e-6, noDimensions],

                         // TODO: Rankine
               'Kelvin': [1,                             absoluteTemperatureDimensions],
              'Celsius': [{
                           convertToBase: value => value - 273.15,
                           convertFromBase: value => value + 273.15,
                         }, absoluteTemperatureDimensions],
             'gas mark': [{
                           convertToBase: value => kToGasMark[findIndex(k => k >= value, gasMarkToK)] || last(kToGasMark),
                           convertFromBase: value => gasMarkToK[findIndex(gasMark => gasMark >= value, kToGasMark)] || last(gasMarkToK),
                         }, absoluteTemperatureDimensions],
           'Fahrenheit': [{
                           convertToBase: value => ((value - 273.15) * 1.8) + 32,
                           convertFromBase: value => ((value - 32) / 1.8) + 273.15,
                         }, absoluteTemperatureDimensions],
};
/* eslint-enable */

export default conversionDescriptors;
