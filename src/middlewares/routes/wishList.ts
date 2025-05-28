import validateBody from "../validateBody";
import {
    bodyNumberIsValid,
    paramNumberIsValid,
    queryIsValidNumber,
} from "../validators";

export const create = [
    validateBody([
        'listingId',
    ]),
    bodyNumberIsValid('listingId'),
];

export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit')
];

export const idIsValid = [
    paramNumberIsValid('id')
];