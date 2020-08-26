const createError = require('http-errors')
const Ajv = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvLocalize = require('ajv-i18n')
const { deepStrictEqual } = require('assert')

let ajv
let previousConstructorOptions
const defaults = {
  v5: true,
  coerceTypes: 'array', // important for query string params
  allErrors: true,
  useDefaults: true,
  $data: true, // required for ajv-keywords
  defaultLanguage: 'en'
}

const availableLanguages = Object.keys(ajvLocalize)

/* in ajv-i18n Portuguese is represented as pt-BR */
const languageNormalizationMap = {
  'pt': 'pt-BR',
  'pt-br': 'pt-BR',
  'pt_BR': 'pt-BR',
  'pt_br': 'pt-BR'
}

const normalizePreferredLanguage = (lang) => languageNormalizationMap[lang] || lang

const chooseLanguage = ({ preferredLanguage }, defaultLanguage) => {
  // console.info ("Middleware chooseLanguage - started");

  if (preferredLanguage) {
    const lang = normalizePreferredLanguage(preferredLanguage)
    if (availableLanguages.includes(lang)) {
      return lang
    }
  }

  return defaultLanguage
}

module.exports = ({ inputSchema, outputSchema, ajvOptions }) => {
  // console.info ("Middleware Validator - started");

  const options = Object.assign({}, defaults, ajvOptions)

  lazyLoadAjv(options);

  const validateInput = inputSchema ? ajv.compile(inputSchema) : null
  const validateOutput = outputSchema ? ajv.compile(outputSchema) : null

  return {
    before (handler, next) {
      // console.info ("Middleware chooseLanguage - before");

      if (!inputSchema) {
        return next()
      }

      const valid = validateInput(handler.event)

      if (!valid) {
        // console.info ("Middleware validator - not valid");

        // const error = new createError.BadRequest('Event object failed validation')
        // handler.event.headers = Object.assign({}, handler.event.headers)
        // const language = chooseLanguage(handler.event, options.defaultLanguage)
        // ajvLocalize[language](validateInput.errors)

        // error.details = validateInput.errors
        // throw error

        handler.response = {
          statusCode: 422,
          body: { message: 'Input failed validation', data: validateInput.errors }
        };
        throw new Error('Input failed validation');
      }

      return next()
    },
    after (handler, next) {
      // console.info ("Middleware chooseLanguage - after");

      if (!outputSchema || (!handler.response && handler.error)) {
        return next()
      }

      const valid = validateOutput(handler.response)

      if (!valid) {
        // const error = new createError.InternalServerError('Response object failed validation')
        // error.details = validateOutput.errors
        // error.response = handler.response
        // throw error

        handler.response = {
          statusCode: 500,
          body: { message: 'Output failed validation', data: validateOutput.errors }
        };
        throw new Error('Output failed validation');
      }

      return next()
    }
  }
}

function lazyLoadAjv (options) {
  // console.info ("Middleware lazyLoadAjv - start");

  if (shouldInitAjv(options)) {
    initAjv(options)
  }

  return ajv
}

function shouldInitAjv (options) {
  // console.info ("Middleware shouldInitAjv - start");

  return !ajv || areConstructorOptionsNew(options)
}

function areConstructorOptionsNew (options) {
  // console.info ("Middleware areConstructorOptionsNew - start");

  try {
    deepStrictEqual(options, previousConstructorOptions)
  } catch (e) {
    return true
  }

  return false
}

function initAjv (options) {
  // console.info ("Middleware initAjv - start");

  ajv = new Ajv(options)
  ajvKeywords(ajv)

  previousConstructorOptions = options
}
