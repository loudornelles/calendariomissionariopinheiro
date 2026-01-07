const COUNTRY_CODE = "55";
const DDD_DIGIT_COUNT = 2;
const LOCAL_PHONE_DIGIT_COUNT = 9;
const DDD_PHONE_DIGIT_COUNT = DDD_DIGIT_COUNT + LOCAL_PHONE_DIGIT_COUNT;

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const WHATSAPP_LINK_TEMPLATE = "https://wa.me/TELEFONE?text=DATAEPERIODO";

export const buildWhatsappLink = (
  phone: string,
  dateLabel: string,
  periodLabel: string
) => {
  const digits = onlyDigits(phone);
  if (!digits) {
    return "";
  }
  const message = `${dateLabel} - ${periodLabel}`;
  return WHATSAPP_LINK_TEMPLATE.replace("TELEFONE", digits).replace(
    "DATAEPERIODO",
    encodeURIComponent(message)
  );
};

const formatLocalPhone = (digits: string) => {
  const trimmed = digits.slice(0, LOCAL_PHONE_DIGIT_COUNT);
  if (!trimmed) {
    return "";
  }
  if (trimmed.length <= 4) {
    return trimmed;
  }
  if (trimmed.length <= 8) {
    const part1 = trimmed.slice(0, 4);
    const part2 = trimmed.slice(4);
    return part2 ? `${part1}-${part2}` : part1;
  }
  const first = trimmed.slice(0, 1);
  const part1 = trimmed.slice(1, 5);
  const part2 = trimmed.slice(5, 9);
  let formatted = first;
  if (part1) {
    formatted += ` ${part1}`;
  }
  if (part2) {
    formatted += `-${part2}`;
  }
  return formatted;
};

const formatFullPhone = (ddd: string, local: string) => {
  const formattedLocal = formatLocalPhone(local);
  if (!formattedLocal) {
    return "";
  }
  return `${COUNTRY_CODE} ${ddd} ${formattedLocal}`;
};

export const DEFAULT_DDD = "51";
export const DDD_OPTIONS = [
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "21",
  "22",
  "24",
  "27",
  "28",
  "31",
  "32",
  "33",
  "34",
  "35",
  "37",
  "38",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "51",
  "53",
  "54",
  "55",
  "61",
  "62",
  "63",
  "64",
  "65",
  "66",
  "67",
  "68",
  "69",
  "71",
  "73",
  "74",
  "75",
  "77",
  "79",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
  "89",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
  "98",
  "99",
];

export const PHONE_PLACEHOLDER = "9 9918-6421";

export const formatPhoneInput = (value: string) => {
  const digits = onlyDigits(value);
  const localDigits =
    digits.length > LOCAL_PHONE_DIGIT_COUNT
      ? digits.slice(-LOCAL_PHONE_DIGIT_COUNT)
      : digits;
  return formatLocalPhone(localDigits);
};

export const normalizePhone = (ddd: string, value: string) => {
  const dddDigits = onlyDigits(ddd).slice(0, DDD_DIGIT_COUNT);
  const rawDigits = onlyDigits(value);
  const localDigits =
    rawDigits.length > LOCAL_PHONE_DIGIT_COUNT
      ? rawDigits.slice(-LOCAL_PHONE_DIGIT_COUNT)
      : rawDigits;
  if (
    dddDigits.length !== DDD_DIGIT_COUNT ||
    localDigits.length !== LOCAL_PHONE_DIGIT_COUNT
  ) {
    return "";
  }
  return formatFullPhone(dddDigits, localDigits);
};

export const normalizePhoneKey = (value: string) => {
  const digits = onlyDigits(value);
  if (!digits || digits.length < DDD_PHONE_DIGIT_COUNT) {
    return "";
  }
  return digits.slice(-DDD_PHONE_DIGIT_COUNT);
};

export const normalizePhoneForRequest = (value: string) => {
  const key = normalizePhoneKey(value);
  if (!key) {
    return "";
  }
  const ddd = key.slice(0, DDD_DIGIT_COUNT);
  const local = key.slice(DDD_DIGIT_COUNT);
  return formatFullPhone(ddd, local);
};

export const formatPhoneDisplay = (value: string) => {
  const key = normalizePhoneKey(value);
  if (!key) {
    return value.trim();
  }
  const ddd = key.slice(0, DDD_DIGIT_COUNT);
  const local = key.slice(DDD_DIGIT_COUNT);
  const formattedLocal = formatLocalPhone(local);
  if (!formattedLocal) {
    return value.trim();
  }
  return `(${ddd}) ${formattedLocal}`;
};
