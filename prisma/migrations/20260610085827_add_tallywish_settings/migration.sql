-- CreateTable
CREATE TABLE "TallyWishSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "store_id" TEXT NOT NULL DEFAULT '',
    "store_secure_key" TEXT NOT NULL DEFAULT '',
    "button_type" TEXT NOT NULL DEFAULT 'both',
    "bottom_offset" INTEGER NOT NULL DEFAULT 20,
    "right_offset" INTEGER NOT NULL DEFAULT 20,
    "bg_color" TEXT NOT NULL DEFAULT '#ff4081',
    "button_text" TEXT NOT NULL DEFAULT '❤ Add to TallyWish',
    "btn_bg" TEXT NOT NULL DEFAULT '#ff4081',
    "btn_color" TEXT NOT NULL DEFAULT '#ffffff',
    "btn_radius" INTEGER NOT NULL DEFAULT 5,
    "enabled" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TallyWishSetting_shop_key" ON "TallyWishSetting"("shop");
