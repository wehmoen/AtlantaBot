const { readdirSync } = require("fs");
const languagesList = readdirSync("./languages")
.map((l) => l.split(".")[0]);

const config = require("../config.js");
const logger = require("./logger");

let languages = languagesList.map((languageName) => {
    return {
        name: languageName,
        data: require("../languages/"+languageName),
        default: languageName === config.defaultLanguage.substr(0, 2)
    };
});

const resolveProperty = (path, object, separator = ".") => {
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => prev && prev[curr], object);
};

module.exports = class i18nManager {
    
    constructor(language){
        this.language = language.substr(0, 2);
        this.languageData = languages.find((l) => l.name === this.language).data;
        this.defaultLanguageData = languages.find((l) => l.default).data;
    }

    /**
     * Gets the translation string for a key
     * @param {string} key The key of the string to get
     * @param {object} options The options for translation
     * @returns {string} The translated string
     */
    t(key, options = {}) {
        // Gets the string
        let translatedString =
        resolveProperty(key, this.languageData) ||
        resolveProperty(key, this.defaultLanguageData);
        // Replace all template string with values
        for (let optionName in options){
            if(!translatedString.includes(`{{{ ${optionName} }}}`)){
                logger.log(`${key} doesn't have a ${optionName} option.`, "warn");
            } else {
                translatedString = translatedString.replace(`{{{ ${optionName} }}}`, options[optionName]);
            }
        }
        return translatedString;
    }

    /**
     * This reloads the language strings
     */
    reload() {
        // Reload language
        delete require.cache[`../languages/${this.language}`];
        this.languageData = require(`../languages/${this.language}`);
        languages.find((l) => l.name === this.language).data = this.languageData;
        // Reload default language
        delete require.cache[`../languages/${this.languages.find((l) => l.default).name}`];
        this.defaultLanguageData = require(`../languages/${this.languages.find((l) => l.default).name}`);
        languages.find((l) => l.default).data = this.defaultLanguageData;
    }

};