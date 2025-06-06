import validateBody from "../validateBody";
import {
    bodyNumberIsValid,
    paramNumberIsValid,
    queryIsValidNumber,
} from "../validators";

export const create = [
    validateBody([
        'listingId',
        'startDate',
        'endDate',
        'totalPrice'
    ]),
    bodyNumberIsValid('listingId'),
    bodyNumberIsValid('totalPrice')
];

export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit')
];

export const idIsValid = [
    paramNumberIsValid('id')
];