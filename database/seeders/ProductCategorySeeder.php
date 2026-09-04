<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    /**
     * Seed the application with the product categories.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Singles', 'slug' => 'singles'],
            ['name' => 'Booster Boxes', 'slug' => 'booster-boxes'],
            ['name' => 'Booster Packs', 'slug' => 'booster-packs'],
            ['name' => 'Bundles', 'slug' => 'bundles'],
            ['name' => 'Accessories', 'slug' => 'accessories'],
        ];

        foreach ($categories as $category) {
            ProductCategory::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
