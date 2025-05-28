import { UserType } from "./enums"

export interface RoleDto {
    id?: number
    name: string,
    description: string,
    level: number
}

export interface PermissionDto {
    id?: number
    name: string,
    description: string
}

export interface AdminPermissionDto {
    id?: number
    adminId: number,
    roleId: number
}

export interface UserDto {
    id?: number,
    firstName: string,
    lastName: string,
    email: string,
    password?: string,
    verified?: boolean,
    active?: boolean,
    isOauth?: boolean,
    type: UserType,
    oAuthDetails?: any,
    createdAt?: Date,
    updatedAt?: Date
}

export interface ListingDto {
    id?: number,
    category: string,
    userId: number,
    type: string,
    streetAddress: string,
    aptSuite: string,
    city: string,
    province: string,
    country: string,
    guestCount: number,
    bedroomCount: number,
    bedCount: number,
    bathroomCount: number,
    amenities: any,
    title: string,
    description: string,
    price: number,
    latitude?: number,
    longitude?: number,
    createdAt?: Date,
    updatedAt?: Date
}

export interface BookingDto {
    id?: number,
    userId: number,
    hostId: number,
    listingId: number,
    totalPrice: number,
    startDate: string,
    endDate: string,
    createdAt?: Date,
    updatedAt?: Date
}

export interface WishListDto {
    id?: number,
    userId: number,
    listingId: number,
    createdAt?: Date,
    updatedAt?: Date
}

export interface MapListingDto {
    country: string,
    province: string,
    city: string
}