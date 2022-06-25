const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

export function isValidPhone(phone: string): boolean {
    try {
        return phoneUtil.isValidNumberForRegion(phoneUtil.parse(phone, 'RU'), 'RU');;

    } catch {
        return false;
    }
}
