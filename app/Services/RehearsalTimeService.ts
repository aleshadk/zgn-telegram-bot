const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

// TODO: rename file
export function isValidPhone(phone: string): boolean {
    try {
        return phoneUtil.isValidNumberForRegion(phoneUtil.parse(phone, 'RU'), 'RU');;

    } catch {
        return false;
    }
}
