const COUNTRY_CODE = "55";
const PHONE_DIGIT_COUNT = 13;

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const withCountryCode = (digits: string) =>
  digits.startsWith(COUNTRY_CODE) ? digits : `${COUNTRY_CODE}${digits}`;

const formatFromDigits = (digits: string) => {
  const country = digits.slice(0, 2);
  const area = digits.slice(2, 4);
  const first = digits.slice(4, 5);
  const part1 = digits.slice(5, 9);
  const part2 = digits.slice(9, 13);

  let formatted = `+${country}`;
  if (area) {
    formatted += ` ${area}`;
  }
  if (first) {
    formatted += ` ${first}`;
  }
  if (part1) {
    formatted += ` ${part1}`;
  }
  if (part2) {
    formatted += `-${part2}`;
  }
  return formatted;
};

export const PHONE_PLACEHOLDER = "+55 51 9 9918-6421";

export const formatPhoneInput = (value: string) => {
  const digits = onlyDigits(value);
  if (!digits) {
    return "";
  }
  const normalized = withCountryCode(digits).slice(0, PHONE_DIGIT_COUNT);
  return formatFromDigits(normalized);
};

export const normalizePhone = (value: string) => {
  const digits = onlyDigits(value);
  if (!digits) {
    return "";
  }
  const normalized = withCountryCode(digits);
  if (normalized.length < PHONE_DIGIT_COUNT) {
    return "";
  }
  return formatFromDigits(normalized.slice(0, PHONE_DIGIT_COUNT));
};
