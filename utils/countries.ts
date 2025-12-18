import countries from 'i18n-iso-countries';
import es from 'i18n-iso-countries/langs/es.json';
import en from 'i18n-iso-countries/langs/en.json';

// Register languages
countries.registerLocale(es);
countries.registerLocale(en);

export interface Country {
  code: string; // ISO 3166-1 alpha-2 code (e.g., "CL", "US")
  name: string; // Country name in selected language
}

export interface Nationality {
  code: string; // ISO 3166-1 alpha-2 code (e.g., "CL", "US")
  name: string; // Nationality name in selected language (e.g., "Chilena", "Estadounidense")
}

/**
 * Get list of all countries with their ISO codes
 * @param language - Language code ('es', 'en', 'es-CL')
 * @returns Array of countries sorted alphabetically by name
 */
export const getCountries = (language: string = 'es'): Country[] => {
  const lang = language.startsWith('es') ? 'es' : 'en';
  const countryNames = countries.getNames(lang, { select: 'official' });

  return Object.entries(countryNames)
    .map(([code, name]) => ({
      code,
      name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get country name by ISO code
 * @param code - ISO 3166-1 alpha-2 code (e.g., "CL")
 * @param language - Language code ('es', 'en', 'es-CL')
 * @returns Country name or empty string if not found
 */
export const getCountryName = (code: string, language: string = 'es'): string => {
  const lang = language.startsWith('es') ? 'es' : 'en';
  return countries.getName(code, lang, { select: 'official' }) || '';
};

/**
 * Get country code by country name
 * @param name - Country name (e.g., "Chile")
 * @param language - Language code ('es', 'en', 'es-CL')
 * @returns ISO 3166-1 alpha-2 code or empty string if not found
 */
export const getCountryCode = (name: string, language: string = 'es'): string => {
  const lang = language.startsWith('es') ? 'es' : 'en';
  return countries.getAlpha2Code(name, lang) || '';
};

/**
 * Get list of nationalities with their ISO country codes
 * This maps country codes to nationality names
 * @param language - Language code ('es', 'en', 'es-CL')
 * @returns Array of nationalities sorted alphabetically by name
 */
export const getNationalities = (language?: string | null): Nationality[] => {
  // Ensure language has a valid default
  const safeLanguage = language || 'es';

  // Map of ISO codes to nationality names in Spanish
  const nationalitiesES: Record<string, string> = {
    AF: 'Afgana',
    AL: 'Albanesa',
    DE: 'Alemana',
    AD: 'Andorrana',
    AO: 'Angoleña',
    AG: 'Antiguana',
    SA: 'Saudí',
    DZ: 'Argelina',
    AR: 'Argentina',
    AM: 'Armenia',
    AU: 'Australiana',
    AT: 'Austriaca',
    AZ: 'Azerbaiyana',
    BS: 'Bahameña',
    BD: 'Bangladesí',
    BB: 'Barbadense',
    BH: 'Bareiní',
    BE: 'Belga',
    BZ: 'Beliceña',
    BJ: 'Beninesa',
    BY: 'Bielorrusa',
    BO: 'Boliviana',
    BA: 'Bosnia',
    BW: 'Botsuanesa',
    BR: 'Brasileña',
    BN: 'Bruneana',
    BG: 'Búlgara',
    BF: 'Burkinesa',
    BI: 'Burundesa',
    BT: 'Butanesa',
    CV: 'Caboverdiana',
    KH: 'Camboyana',
    CM: 'Camerunesa',
    CA: 'Canadiense',
    QA: 'Catarí',
    TD: 'Chadiana',
    CL: 'Chilena',
    CN: 'China',
    CY: 'Chipriota',
    CO: 'Colombiana',
    KM: 'Comorense',
    CG: 'Congoleña',
    CD: 'Congoleña',
    KP: 'Norcoreana',
    KR: 'Surcoreana',
    CR: 'Costarricense',
    CI: 'Marfileña',
    HR: 'Croata',
    CU: 'Cubana',
    DK: 'Danesa',
    DM: 'Dominiqués',
    EC: 'Ecuatoriana',
    EG: 'Egipcia',
    SV: 'Salvadoreña',
    AE: 'Emiratí',
    ER: 'Eritrea',
    SK: 'Eslovaca',
    SI: 'Eslovena',
    ES: 'Española',
    US: 'Estadounidense',
    EE: 'Estonia',
    ET: 'Etíope',
    PH: 'Filipina',
    FI: 'Finlandesa',
    FJ: 'Fiyiana',
    FR: 'Francesa',
    GA: 'Gabonesa',
    GM: 'Gambiana',
    GE: 'Georgiana',
    GH: 'Ghanesa',
    GD: 'Granadina',
    GR: 'Griega',
    GT: 'Guatemalteca',
    GN: 'Guineana',
    GQ: 'Ecuatoguineana',
    GW: 'Guineana',
    GY: 'Guyanesa',
    HT: 'Haitiana',
    HN: 'Hondureña',
    HU: 'Húngara',
    IN: 'India',
    ID: 'Indonesia',
    IQ: 'Iraquí',
    IR: 'Iraní',
    IE: 'Irlandesa',
    IS: 'Islandesa',
    IL: 'Israelí',
    IT: 'Italiana',
    JM: 'Jamaiquina',
    JP: 'Japonesa',
    JO: 'Jordana',
    KZ: 'Kazaja',
    KE: 'Keniana',
    KG: 'Kirguisa',
    KI: 'Kiribatiana',
    KW: 'Kuwaití',
    LA: 'Laosiana',
    LS: 'Lesotense',
    LV: 'Letona',
    LB: 'Libanesa',
    LR: 'Liberiana',
    LY: 'Libia',
    LI: 'Liechtensteiniana',
    LT: 'Lituana',
    LU: 'Luxemburguesa',
    MK: 'Macedonia',
    MG: 'Malgache',
    MY: 'Malasia',
    MW: 'Malauí',
    MV: 'Maldiva',
    ML: 'Maliense',
    MT: 'Maltesa',
    MA: 'Marroquí',
    MH: 'Marshalesa',
    MU: 'Mauriciana',
    MR: 'Mauritana',
    MX: 'Mexicana',
    FM: 'Micronesia',
    MD: 'Moldava',
    MC: 'Monegasca',
    MN: 'Mongola',
    ME: 'Montenegrina',
    MZ: 'Mozambiqueña',
    MM: 'Birmana',
    NA: 'Namibia',
    NR: 'Nauruana',
    NP: 'Nepalí',
    NI: 'Nicaragüense',
    NE: 'Nigerina',
    NG: 'Nigeriana',
    NO: 'Noruega',
    NZ: 'Neozelandesa',
    OM: 'Omaní',
    NL: 'Neerlandesa',
    PK: 'Pakistaní',
    PW: 'Palauana',
    PA: 'Panameña',
    PG: 'Papú',
    PY: 'Paraguaya',
    PE: 'Peruana',
    PL: 'Polaca',
    PT: 'Portuguesa',
    GB: 'Británica',
    CF: 'Centroafricana',
    CZ: 'Checa',
    DO: 'Dominicana',
    RO: 'Rumana',
    RW: 'Ruandesa',
    RU: 'Rusa',
    WS: 'Samoana',
    KN: 'Sancristobaleña',
    SM: 'Sanmarinense',
    VC: 'Sanvicentina',
    SH: 'Santalenense',
    LC: 'Santalucense',
    ST: 'Santotomense',
    SN: 'Senegalesa',
    RS: 'Serbia',
    SC: 'Seychellense',
    SL: 'Sierraleonesa',
    SG: 'Singapurense',
    SY: 'Siria',
    SO: 'Somalí',
    LK: 'Esrilanquesa',
    SZ: 'Suazi',
    ZA: 'Sudafricana',
    SD: 'Sudanesa',
    SS: 'Sursudanesa',
    SE: 'Sueca',
    CH: 'Suiza',
    SR: 'Surinamesa',
    TH: 'Tailandesa',
    TZ: 'Tanzana',
    TJ: 'Tayika',
    TL: 'Timorense',
    TG: 'Togolesa',
    TO: 'Tongana',
    TT: 'Trinitense',
    TN: 'Tunecina',
    TM: 'Turcomana',
    TR: 'Turca',
    TV: 'Tuvaluana',
    UA: 'Ucraniana',
    UG: 'Ugandesa',
    UY: 'Uruguaya',
    UZ: 'Uzbeka',
    VU: 'Vanuatuense',
    VE: 'Venezolana',
    VN: 'Vietnamita',
    YE: 'Yemení',
    DJ: 'Yibutiana',
    ZM: 'Zambiana',
    ZW: 'Zimbabuense',
  };

  // Map of ISO codes to nationality names in English
  const nationalitiesEN: Record<string, string> = {
    AF: 'Afghan',
    AL: 'Albanian',
    DE: 'German',
    AD: 'Andorran',
    AO: 'Angolan',
    AG: 'Antiguan',
    SA: 'Saudi',
    DZ: 'Algerian',
    AR: 'Argentine',
    AM: 'Armenian',
    AU: 'Australian',
    AT: 'Austrian',
    AZ: 'Azerbaijani',
    BS: 'Bahamian',
    BD: 'Bangladeshi',
    BB: 'Barbadian',
    BH: 'Bahraini',
    BE: 'Belgian',
    BZ: 'Belizean',
    BJ: 'Beninese',
    BY: 'Belarusian',
    BO: 'Bolivian',
    BA: 'Bosnian',
    BW: 'Motswana',
    BR: 'Brazilian',
    BN: 'Bruneian',
    BG: 'Bulgarian',
    BF: 'Burkinabe',
    BI: 'Burundian',
    BT: 'Bhutanese',
    CV: 'Cape Verdean',
    KH: 'Cambodian',
    CM: 'Cameroonian',
    CA: 'Canadian',
    QA: 'Qatari',
    TD: 'Chadian',
    CL: 'Chilean',
    CN: 'Chinese',
    CY: 'Cypriot',
    CO: 'Colombian',
    KM: 'Comorian',
    CG: 'Congolese',
    CD: 'Congolese',
    KP: 'North Korean',
    KR: 'South Korean',
    CR: 'Costa Rican',
    CI: 'Ivorian',
    HR: 'Croatian',
    CU: 'Cuban',
    DK: 'Danish',
    DM: 'Dominican',
    EC: 'Ecuadorian',
    EG: 'Egyptian',
    SV: 'Salvadoran',
    AE: 'Emirati',
    ER: 'Eritrean',
    SK: 'Slovak',
    SI: 'Slovenian',
    ES: 'Spanish',
    US: 'American',
    EE: 'Estonian',
    ET: 'Ethiopian',
    PH: 'Filipino',
    FI: 'Finnish',
    FJ: 'Fijian',
    FR: 'French',
    GA: 'Gabonese',
    GM: 'Gambian',
    GE: 'Georgian',
    GH: 'Ghanaian',
    GD: 'Grenadian',
    GR: 'Greek',
    GT: 'Guatemalan',
    GN: 'Guinean',
    GQ: 'Equatorial Guinean',
    GW: 'Guinea-Bissauan',
    GY: 'Guyanese',
    HT: 'Haitian',
    HN: 'Honduran',
    HU: 'Hungarian',
    IN: 'Indian',
    ID: 'Indonesian',
    IQ: 'Iraqi',
    IR: 'Iranian',
    IE: 'Irish',
    IS: 'Icelandic',
    IL: 'Israeli',
    IT: 'Italian',
    JM: 'Jamaican',
    JP: 'Japanese',
    JO: 'Jordanian',
    KZ: 'Kazakh',
    KE: 'Kenyan',
    KG: 'Kyrgyz',
    KI: 'I-Kiribati',
    KW: 'Kuwaiti',
    LA: 'Laotian',
    LS: 'Basotho',
    LV: 'Latvian',
    LB: 'Lebanese',
    LR: 'Liberian',
    LY: 'Libyan',
    LI: 'Liechtensteiner',
    LT: 'Lithuanian',
    LU: 'Luxembourgish',
    MK: 'Macedonian',
    MG: 'Malagasy',
    MY: 'Malaysian',
    MW: 'Malawian',
    MV: 'Maldivian',
    ML: 'Malian',
    MT: 'Maltese',
    MA: 'Moroccan',
    MH: 'Marshallese',
    MU: 'Mauritian',
    MR: 'Mauritanian',
    MX: 'Mexican',
    FM: 'Micronesian',
    MD: 'Moldovan',
    MC: 'Monegasque',
    MN: 'Mongolian',
    ME: 'Montenegrin',
    MZ: 'Mozambican',
    MM: 'Burmese',
    NA: 'Namibian',
    NR: 'Nauruan',
    NP: 'Nepalese',
    NI: 'Nicaraguan',
    NE: 'Nigerien',
    NG: 'Nigerian',
    NO: 'Norwegian',
    NZ: 'New Zealander',
    OM: 'Omani',
    NL: 'Dutch',
    PK: 'Pakistani',
    PW: 'Palauan',
    PA: 'Panamanian',
    PG: 'Papua New Guinean',
    PY: 'Paraguayan',
    PE: 'Peruvian',
    PL: 'Polish',
    PT: 'Portuguese',
    GB: 'British',
    CF: 'Central African',
    CZ: 'Czech',
    DO: 'Dominican',
    RO: 'Romanian',
    RW: 'Rwandan',
    RU: 'Russian',
    WS: 'Samoan',
    KN: 'Kittitian',
    SM: 'Sammarinese',
    VC: 'Vincentian',
    SH: 'Saint Helenian',
    LC: 'Saint Lucian',
    ST: 'Sao Tomean',
    SN: 'Senegalese',
    RS: 'Serbian',
    SC: 'Seychellois',
    SL: 'Sierra Leonean',
    SG: 'Singaporean',
    SY: 'Syrian',
    SO: 'Somali',
    LK: 'Sri Lankan',
    SZ: 'Swazi',
    ZA: 'South African',
    SD: 'Sudanese',
    SS: 'South Sudanese',
    SE: 'Swedish',
    CH: 'Swiss',
    SR: 'Surinamese',
    TH: 'Thai',
    TZ: 'Tanzanian',
    TJ: 'Tajik',
    TL: 'Timorese',
    TG: 'Togolese',
    TO: 'Tongan',
    TT: 'Trinidadian',
    TN: 'Tunisian',
    TM: 'Turkmen',
    TR: 'Turkish',
    TV: 'Tuvaluan',
    UA: 'Ukrainian',
    UG: 'Ugandan',
    UY: 'Uruguayan',
    UZ: 'Uzbek',
    VU: 'Ni-Vanuatu',
    VE: 'Venezuelan',
    VN: 'Vietnamese',
    YE: 'Yemeni',
    DJ: 'Djiboutian',
    ZM: 'Zambian',
    ZW: 'Zimbabwean',
  };

  const lang = safeLanguage.startsWith('es') ? 'es' : 'en';
  const nationalityMap = lang === 'es' ? nationalitiesES : nationalitiesEN;

  return Object.entries(nationalityMap)
    .map(([code, name]) => ({
      code,
      name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get nationality name by ISO country code
 * @param code - ISO 3166-1 alpha-2 code (e.g., "CL")
 * @param language - Language code ('es', 'en', 'es-CL')
 * @returns Nationality name or empty string if not found
 */
export const getNationalityName = (code: string, language?: string | null): string => {
  if (!code) return '';
  const nationalities = getNationalities(language);
  return nationalities.find((n) => n.code === code)?.name || '';
};

/**
 * Get country code by nationality name
 * @param name - Nationality name (e.g., "Chilena")
 * @param language - Language code ('es', 'en', 'es-CL')
 * @returns ISO 3166-1 alpha-2 code or empty string if not found
 */
export const getNationalityCode = (name: string, language?: string | null): string => {
  if (!name) return '';
  const nationalities = getNationalities(language);
  return nationalities.find((n) => n.name.toLowerCase() === name.toLowerCase())?.code || '';
};
