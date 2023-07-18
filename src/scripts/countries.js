import { useI18n } from '@/stores/misc.js';

const { t } = useI18n();

export function translateCountryNames(countries) {
  for (const country of countries) {
    switch (country.id) {
      case "AE":
        country.title = t('countries.AE');
        break;
      case "AR":
        country.title = t('countries.AR');
        break;
      case "AT":
        country.title = t('countries.AT');
        break;
      case "AU":
        country.title = t('countries.AU');
        break;
      case "BE":
        country.title = t('countries.BE');
        break;
      case "BO":
        country.title = t('countries.BO');
        break;
      case "BR":
        country.title = t('countries.BR');
        break;
      case "CA":
        country.title = t('countries.CA');
        break;
      case "CH":
        country.title = t('countries.CH');
        break;
      case "CL":
        country.title = t('countries.CL');
        break;
      case "CO":
        country.title = t('countries.CO');
        break;
      case "CR":
        country.title = t('countries.CR');
        break;
      case "CZ":
        country.title = t('countries.CZ');
        break;
      case "DE":
        country.title = t('countries.DE');
        break;
      case "DK":
        country.title = t('countries.DK');;
        break;
      case "DO":
        country.title = t('countries.DO');
        break;
      case "EC":
        country.title = t('countries.EC');
        break;
      case "EE":
        country.title = t('countries.EE');
        break;
      case "EG":
        country.title = t('countries.EG');
        break;
      case "ES":
        country.title = t('countries.ES');
        break;
      case "FI":
        country.title = t('countries.FI');
        break;
      case "FR":
        country.title = t('countries.FR');
        break;
      case "GB":
        country.title = t('countries.GB');
        break;
      case "GT":
        country.title = t('countries.GT');
        break;
      case "HN":
        country.title = t('countries.HN');
        break;
      case "HU":
        country.title = t('countries.HU');
        break;
      case "ID":
        country.title = t('countries.ID');
        break;
      case "IE":
        country.title = t('countries.IE');
        break;
      case "IL":
        country.title = t('countries.IL');
        break;
      case "IN":
        country.title = t('countries.IN');
        break;
      case "IS":
        country.title = t('countries.IS');
        break;
      case "IT":
        country.title = t('countries.IT');
        break;
      case "JP":
        country.title = t('countries.JP');
        break;
      case "KE":
        country.title = t('countries.KE');
        break;
      case "KR":
        country.title = t('countries.KR');
        break;
      case "LU":
        country.title = t('countries.LU');
        break;
      case "MX":
        country.title = t('countries.MX');
        break;
      case "NG":
        country.title = t('countries.NG');
        break;
      case "NI":
        country.title = t('countries.NI');
        break;
      case "NL":
        country.title = t('countries.NL');
        break;
      case "NO":
        country.title = t('countries.NO');
        break;
      case "NZ":
        country.title = t('countries.NZ');
        break;
      case "PA":
        country.title = t('countries.PA');
        break;
      case "PE":
        country.title = t('countries.PE');
        break;
      case "PL":
        country.title = t('countries.PL');
        break;
      case "PT":
        country.title = t('countries.PT');
        break;
      case "PY":
        country.title = t('countries.PY');
        break;
      case "RO":
        country.title = t('countries.RO');
        break;
      case "RS":
        country.title = t('countries.RS');
        break;
      case "RU":
        country.title = t('countries.RU');
        break;
      case "SA":
        country.title = t('countries.SA');
        break;
      case "SE":
        country.title = t('countries.SE');
        break;
      case "SV":
        country.title = t('countries.SV');
        break;
      case "TR":
        country.title = t('countries.TR');
        break;
      case "TZ":
        country.title = t('countries.TZ');
        break;
      case "UA":
        country.title = t('countries.UA');
        break;
      case "UG":
        country.title = t('countries.UG');
        break;
      case "US":
        country.title = t('countries.US');
        break;
      case "UY":
        country.title = t('countries.UY');
        break;
      case "ZA":
        country.title = t('countries.ZA');
        break;
      case "ZW":
        country.title = t('countries.ZW');
        break;
      case "ZZ":
        country.title = t('countries.ZZ');
        break;
    }
  };
};