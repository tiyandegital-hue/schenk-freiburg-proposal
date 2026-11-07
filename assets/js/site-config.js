/* Site-wide constants — business identity lives HERE, once.
   BUSINESS_NAME is the single swappable constant for
   "Sanitärtechnik Schenk GmbH". Static HTML uses the identical
   string; all dynamic JS strings (bot bubbles, summary card)
   read it from here. Do not hard-code variants elsewhere. */
window.SITE = {
  BUSINESS_NAME: "Sanitärtechnik Schenk GmbH",
  BUSINESS_SHORT: "Sanitärtechnik Schenk",
  PHONE_DISPLAY: "+49 761 46655",
  PHONE_TEL: "+4976146655",
  EMAIL: "dieter.schenk-sanitaer-technik@web.de",
  ADDRESS: "Sasbacher Straße 4, 79111 Freiburg",
  CITY: "Freiburg im Breisgau",
  SERVICE_AREA_KM: 25
};
