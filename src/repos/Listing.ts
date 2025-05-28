import { MapListingDto } from "../types/dtos";
import Repo from "./bases/Repo";
import { Prisma } from "@prisma/client";

export default class Listing extends Repo {
    constructor() {
        super('listing');
    }

    public async insert(data: any, media: any) {
        try {
            const newItem = await this.prisma.listing.create({
                data: {
                    userId: data.userId,
                    category: data.category,
                    type: data.type,
                    streetAddress: data.streetAddress,
                    aptSuite: data.aptSuite,
                    city: data.city,
                    province: data.province,
                    country: data.country,
                    guestCount: data.guestCount,
                    bedroomCount: data.bedroomCount,
                    bedCount: data.bedCount,
                    bathroomCount: data.bathroomCount,
                    amenities: data.amenities,
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    listingPhotos: {
                        createMany: {
                            data: media
                        }
                    }
                },
                include: {
                    listingPhotos: {
                        select: {
                            imageUrl: true
                        }
                    }
                }
            })
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            console.log(error)
            return this.handleDatabaseError(error);
        }
    }

    public async paginateListings(skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                let items = await tx.listing.findMany({
                    skip,
                    take,
                    include: {
                        listingPhotos: {
                            select: {
                                imageUrl: true
                            }
                        }
                    }
                });

                const totalItems = await tx.listing.count()

                return { items: items, totalItems };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async paginateByCategory(category: string, skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = { category };
                let items = await tx.listing.findMany({
                    where: where,
                    skip,
                    take,
                    include: {
                        listingPhotos: {
                            select: {
                                imageUrl: true
                            }
                        }
                    }
                });

                const totalItems = await tx.listing.count({ where: where })

                return { items: items, totalItems };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async searchTitle(search: string, skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where: Prisma.ListingWhereInput = {
                    title: {
                        contains: search,
                        mode: 'insensitive' as Prisma.QueryMode
                    },
                };

                let items = await tx.listing.findMany({
                    where,
                    skip,
                    take,
                    include: {
                        listingPhotos: {
                            select: {
                                imageUrl: true
                            }
                        }
                    }
                });

                const totalItems = await tx.listing.count({ where })

                return { items: items, totalItems };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getWithId(id: number) {
        try {
            const data = await super.getItemWithRelation({ id }, {
                listingPhotos: {
                    select: {
                        imageUrl: true
                    }
                }
            });
            return data;
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async mapListings(mapListingDto: MapListingDto) {
        try {
            const data = await this.prisma.listing.findMany({
                where: {
                    country: {
                        contains: mapListingDto.country,
                        mode: 'insensitive' as Prisma.QueryMode
                    },
                    province: {
                        contains: mapListingDto.province,
                        mode: 'insensitive' as Prisma.QueryMode
                    },
                    city: {
                        contains: mapListingDto.city,
                        mode: 'insensitive' as Prisma.QueryMode
                    },
                },
                include: {
                    listingPhotos: {
                        select: {
                            imageUrl: true
                        }
                    }
                }
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

}