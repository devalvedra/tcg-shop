<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\District;
use App\Models\Province;
use App\Models\Subdistrict;
use Illuminate\Http\JsonResponse;

class RegionController extends Controller
{
    /**
     * List the cities for the given province.
     */
    public function cities(Province $province): JsonResponse
    {
        return response()->json(
            $province->cities()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (City $city) => ['id' => $city->id, 'name' => $city->name]),
        );
    }

    /**
     * List the districts for the given city.
     */
    public function districts(City $city): JsonResponse
    {
        return response()->json(
            $city->districts()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (District $district) => ['id' => $district->id, 'name' => $district->name]),
        );
    }

    /**
     * List the subdistricts for the given district.
     */
    public function subdistricts(District $district): JsonResponse
    {
        return response()->json(
            $district->subdistricts()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Subdistrict $subdistrict) => ['id' => $subdistrict->id, 'name' => $subdistrict->name]),
        );
    }
}
