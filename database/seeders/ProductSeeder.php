<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed the application with a demo product catalog.
     */
    public function run(): void
    {
        $openPo = now()->addDays(7)->toDateString();
        $closePo = now()->addDays(30)->toDateString();

        $products = [
            [
                'name' => 'Charizard VMAX (Champion\'s Path)',
                'description' => 'The iconic fire-breathing chase card, near-mint condition.',
                'category' => 'singles',
                'price' => '149.99',
                'sell_price' => '129.99',
                'stock' => 3,
                'status' => Product::STATUS_READY,
                'open_po_date' => null,
                'close_po_date' => null,
            ],
            [
                'name' => 'Umbreon VMAX (Evolving Skies)',
                'description' => 'The alternate-art dark moon fox from Evolving Skies.',
                'category' => 'singles',
                'price' => '199.99',
                'sell_price' => '184.99',
                'stock' => 2,
                'status' => Product::STATUS_READY,
                'open_po_date' => null,
                'close_po_date' => null,
            ],
            [
                'name' => 'Giratina V (Lost Origin Alt Art)',
                'description' => 'Alternate-art Giratina V, accepting pre-orders.',
                'category' => 'singles',
                'price' => '89.99',
                'sell_price' => null,
                'stock' => 0,
                'status' => Product::STATUS_PRE_ORDER,
                'open_po_date' => $openPo,
                'close_po_date' => $closePo,
            ],
            [
                'name' => 'Prismatic Evolutions Booster Box',
                'description' => 'Sealed booster box of the hotly anticipated Prismatic Evolutions.',
                'category' => 'booster-boxes',
                'price' => '159.99',
                'sell_price' => null,
                'stock' => 0,
                'status' => Product::STATUS_PRE_ORDER,
                'open_po_date' => $openPo,
                'close_po_date' => $closePo,
            ],
            [
                'name' => 'Obsidian Flames Booster Box',
                'description' => 'Sealed booster box featuring the Charizard ex line.',
                'category' => 'booster-boxes',
                'price' => '119.99',
                'sell_price' => '109.99',
                'stock' => 12,
                'status' => Product::STATUS_READY,
                'open_po_date' => null,
                'close_po_date' => null,
            ],
            [
                'name' => 'Evolving Skies Booster Box',
                'description' => 'Sealed Evolving Skies booster box, currently unavailable.',
                'category' => 'booster-boxes',
                'price' => '299.99',
                'sell_price' => null,
                'stock' => 0,
                'status' => Product::STATUS_UNAVAILABLE,
                'open_po_date' => null,
                'close_po_date' => null,
            ],
            [
                'name' => 'Pokémon 151 Booster Pack',
                'description' => 'Single booster pack from the Kanto-themed 151 set.',
                'category' => 'booster-packs',
                'price' => '12.99',
                'sell_price' => null,
                'stock' => 200,
                'status' => Product::STATUS_READY,
                'open_po_date' => null,
                'close_po_date' => null,
            ],
            [
                'name' => 'Surging Sparks Booster Pack',
                'description' => 'Single booster pack from the Surging Sparks set.',
                'category' => 'booster-packs',
                'price' => '10.99',
                'sell_price' => null,
                'stock' => 0,
                'status' => Product::STATUS_PRE_ORDER,
                'open_po_date' => $openPo,
                'close_po_date' => $closePo,
            ],
            [
                'name' => 'Fusion Strike Booster Pack',
                'description' => 'Single booster pack from the Fusion Strike set.',
                'category' => 'booster-packs',
                'price' => '9.99',
                'sell_price' => null,
                'stock' => 150,
                'status' => Product::STATUS_READY,
                'open_po_date' => null,
                'close_po_date' => null,
            ],
            [
                'name' => 'Charizard ex Elite Trainer Box',
                'description' => 'Elite Trainer Box with sleeves, dice, and booster packs.',
                'category' => 'bundles',
                'price' => '54.99',
                'sell_price' => '49.99',
                'stock' => 8,
                'status' => Product::STATUS_READY,
                'open_po_date' => null,
                'close_po_date' => null,
            ],
            [
                'name' => 'Pokémon 151 Booster Bundle',
                'description' => 'Bundle of six 151 booster packs in a compact box.',
                'category' => 'bundles',
                'price' => '45.99',
                'sell_price' => null,
                'stock' => 15,
                'status' => Product::STATUS_READY,
                'open_po_date' => null,
                'close_po_date' => null,
            ],
            [
                'name' => 'Pokémon Play Mat (Paldea Evolved)',
                'description' => 'Double-sided play mat with a Paldea Evolved theme.',
                'category' => 'accessories',
                'price' => '24.99',
                'sell_price' => null,
                'stock' => 40,
                'status' => Product::STATUS_READY,
                'open_po_date' => null,
                'close_po_date' => null,
            ],
            [
                'name' => 'Dragon Shield Card Sleeves (60 ct)',
                'description' => 'Matte card sleeves to protect your prized collection.',
                'category' => 'accessories',
                'price' => '14.99',
                'sell_price' => null,
                'stock' => 80,
                'status' => Product::STATUS_READY,
                'open_po_date' => null,
                'close_po_date' => null,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['name' => $product['name']], $product);
        }
    }
}
