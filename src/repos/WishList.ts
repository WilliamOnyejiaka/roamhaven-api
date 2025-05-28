import { WishListDto } from "../types/dtos";
import Repo from "./bases/Repo";

export default class WishList extends Repo {

    public constructor() {
        super('wishList');
    }

    public async insertWishList(wishListDto: WishListDto) {
        return await this.insert(wishListDto);
    }

    public async wishList(userId: number, skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = { userId };
                let items = await tx.wishList.findMany({
                    where: where,
                    skip,
                    take,
                    include: {
                        listing: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                price: true,
                                streetAddress: true,
                                city: true,
                                province: true,
                                country: true,
                                guestCount: true,
                                bedroomCount: true,
                                bedCount: true,
                                bathroomCount: true,
                                amenities: true,
                                listingPhotos: {
                                    select: {
                                        imageUrl: true,
                                    }
                                },
                                latitude: true,
                                longitude: true,
                                createdAt: true,
                                updatedAt: true,
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        profilePicture: true
                                    }
                                }
                            }
                        }
                    }
                });

                const totalItems = await tx.wishList.count({ where: where })

                return { items: items, totalItems };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}