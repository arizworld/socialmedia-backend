"use strict";
// /* LocaleService
//  */
// import i18n, { I18n } from "i18n";
// import { i18nConfiguration } from "../config/i18nConfig";
// export class LocaleService {
//   /**
//    *
//    * @param i18nProvider The i18n provider
//    */
//   public i18nProvider: I18n;
//   constructor(i18nProvider = new I18n(i18nConfiguration)) {
//     this.i18nProvider = i18nProvider;
//   }
//   /**
//    *
//    * @returns {string} The current locale code
//    */
//   getCurrentLocale() {
//     return this.i18nProvider.getLocale();
//   }
//   /**
//    *
//    * @returns string[] The list of available locale codes
//    */
//   getLocales() {
//     return this.i18nProvider.getLocales();
//   }
//   /**
//    *
//    * @param locale The locale to set. Must be from the list of available locales.
//    */
//   setLocale(locale: string) {
//     if (this.getLocales().indexOf(locale) !== -1) {
//       this.i18nProvider.setLocale(locale);
//     }
//   }
//   /**
//    *
//    * @param string String to translate
//    * @param args Extra parameters
//    * @returns {string} Translated string
//    */
//   translate(string: string, args = undefined) {
//     return this.i18nProvider.translate(string, args);
//   }
//   /**
//    *
//    * @param phrase Object to translate
//    * @param count The plural number
//    * @returns {string} Translated string
//    */
//   translatePlurals(phrase, count) {
//     return this.i18nProvider.translateN(phrase, count);
//   }
// }
