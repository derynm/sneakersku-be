/*
  Warnings:

  - You are about to drop the column `price` on the `shoes` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `shoes` table. All the data in the column will be lost.
  - You are about to drop the column `shoe_detail_id` on the `shoes` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `shoes` table. All the data in the column will be lost.
  - You are about to drop the column `variant` on the `shoes` table. All the data in the column will be lost.
  - You are about to drop the `shoe_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaction_items` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `base_price` to the `shoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand_id` to the `shoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `shoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `shoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `shoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variants` to the `shoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `items` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "shoe_details" DROP CONSTRAINT "shoe_details_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "shoe_details" DROP CONSTRAINT "shoe_details_category_id_fkey";

-- DropForeignKey
ALTER TABLE "shoes" DROP CONSTRAINT "shoes_shoe_detail_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction_items" DROP CONSTRAINT "transaction_items_transaction_id_fkey";

-- AlterTable
ALTER TABLE "shoes" DROP COLUMN "price",
DROP COLUMN "quantity",
DROP COLUMN "shoe_detail_id",
DROP COLUMN "size",
DROP COLUMN "variant",
ADD COLUMN     "base_price" INTEGER NOT NULL,
ADD COLUMN     "brand_id" INTEGER NOT NULL,
ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD COLUMN     "description" VARCHAR(255) NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "variants" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "items" JSONB NOT NULL;

-- DropTable
DROP TABLE "shoe_details";

-- DropTable
DROP TABLE "transaction_items";

-- AddForeignKey
ALTER TABLE "shoes" ADD CONSTRAINT "shoes_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shoes" ADD CONSTRAINT "shoes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
