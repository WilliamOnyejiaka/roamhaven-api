import { env } from "../../config";
import { ResourceType, UserType } from "../../types/enums";
import validateBody from "../validateBody"; import {
    emailIsValid,
    passwordIsValid,
    tokenIsPresent,
    userEmailExists
} from "../validators";
import uploads from "../multer";
import UserRepo from "../../repos/UserRepo"; // Adjust path to point to the UserRepo class file

const repo = new UserRepo();
export const signUp = [
    uploads(ResourceType.IMAGE).single('profilePicture'),
    validateBody([
        'firstName',
        'lastName',
        'password',
        'email'
    ]),
    emailIsValid,
    passwordIsValid, // TODO: add a proper phone number validation check 
    userEmailExists<UserRepo>(repo)
];

export const login = [
    validateBody(['email', 'password'])
];

export const logOut = [
    tokenIsPresent
]

export const resetPassword = [
    validateBody([
        'password',
        'otp',
        'email'
    ]),
    passwordIsValid
];



// export const resetPassword = [
//     validateJWT([UserType.ADMIN, UserType.VENDOR, UserType.CUSTOMER]),
//     validateBody([
//         'password',
//     ]),
//     passwordIsValid
// ];