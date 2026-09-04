<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    /**
     * Seed the application with a demo set of storefront banners.
     */
    public function run(): void
    {
        $banners = [
            [
                'title' => 'New sets every week',
                'subtitle' => 'Shop the latest booster boxes, bundles, and chase cards before they sell out.',
                'image' => null,
                'link_url' => '/catalog',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Pre-orders are open',
                'subtitle' => 'Reserve upcoming releases now and secure your copy on day one.',
                'image' => null,
                'link_url' => '/catalog?status=pre-order',
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::updateOrCreate(['title' => $banner['title']], $banner);
        }
    }
}
