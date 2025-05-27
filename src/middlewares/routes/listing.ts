import { env } from "../../config";
import { ResourceType, UserType } from "../../types/enums";
import validateBody from "../validateBody";
import {
    bodyNumberIsValid,
    emailIsValid,
    paramNumberIsValid,
    passwordIsValid,
    queryIsValidNumber,
    tokenIsPresent,
    userEmailExists
} from "../validators";
import uploads from "../multer";

export const create = [
    uploads(ResourceType.IMAGE).array("listingPhotos", 10),
    validateBody([
        'category',
        'type',
        'streetAddress',
        'aptSuite',
        'city',
        'province',
        'country',
        'guestCount',
        'bedroomCount',
        'bedCount',
        'bathroomCount',
        'amenities',
        'title',
        'description',
        'price'
    ]),
    bodyNumberIsValid('bedCount'),
    bodyNumberIsValid('bathroomCount'),
    bodyNumberIsValid('bedroomCount'),
    bodyNumberIsValid('price'),
    bodyNumberIsValid('guestCount'),
];

export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit')
];

export const idIsValid = [
    paramNumberIsValid('id')
];