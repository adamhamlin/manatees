-- CreateTable
CREATE TABLE "deck" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "watermark" TEXT NOT NULL,

    CONSTRAINT "deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "black_card" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "pickCount" INTEGER NOT NULL,
    "deckId" INTEGER NOT NULL,

    CONSTRAINT "black_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "white_card" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "deckId" INTEGER NOT NULL,

    CONSTRAINT "white_card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deck_name_key" ON "deck"("name");

-- CreateIndex
CREATE UNIQUE INDEX "black_card_content_key" ON "black_card"("content");

-- CreateIndex
CREATE UNIQUE INDEX "white_card_content_key" ON "white_card"("content");

-- AddForeignKey
ALTER TABLE "black_card" ADD CONSTRAINT "black_card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "white_card" ADD CONSTRAINT "white_card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
