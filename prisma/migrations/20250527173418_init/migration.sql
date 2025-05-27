/*
  Warnings:

  - A unique constraint covering the columns `[userId,hostId,listingId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Booking_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Booking_userId_hostId_listingId_key" ON "Booking"("userId", "hostId", "listingId");
