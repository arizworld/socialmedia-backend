import { I18n } from "i18n";
import path from "path";

const i18n = new I18n();
i18n.configure({
  locales: ["en", "de"],
  directory: path.join(__dirname, "../lang"),
  updateFiles: false,
  autoReload: true,
});

export default i18n;
