"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductPriceHistory1792236249000 = void 0;
class CreateProductPriceHistory1792236249000 {
    constructor() {
        this.name = 'CreateProductPriceHistory1792236249000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "product_price_history" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      "product_id" uuid NOT NULL,
      "previous_price" numeric(12,2),
      "new_price" numeric(12,2) NOT NULL,
      "quantity_on_hand" numeric(12,3) NOT NULL DEFAULT '0',
      "source" character varying(32) NOT NULL,
      "changed_by_id" uuid,
      CONSTRAINT "PK_product_price_history" PRIMARY KEY ("id"),
      CONSTRAINT "FK_product_price_history_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    )`);
        await queryRunner.query('CREATE INDEX "IDX_product_price_history_product_created" ON "product_price_history" ("product_id", "created_at")');
        await queryRunner.query(`INSERT INTO "product_price_history" ("product_id", "previous_price", "new_price", "quantity_on_hand", "source")
      SELECT product."id", NULL, product."purchase_price", COALESCE(SUM(balance."quantity_on_hand"), 0), 'migration_snapshot'
      FROM "products" product
      LEFT JOIN "stock_balances" balance ON balance."product_id" = product."id" AND balance."deleted_at" IS NULL
      WHERE product."deleted_at" IS NULL
      GROUP BY product."id", product."purchase_price"`);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS "product_price_history"');
    }
}
exports.CreateProductPriceHistory1792236249000 = CreateProductPriceHistory1792236249000;
//# sourceMappingURL=1792236249000-CreateProductPriceHistory.js.map