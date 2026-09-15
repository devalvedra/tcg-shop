<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RegionSeeder extends Seeder
{
    /**
     * The region files shipped in storage/app/private mapped to their table
     * and the column holding the parent region id.
     *
     * @var array<string, array{table: string, parent: string|null}>
     */
    private const array FILES = [
        'provinsi.csv' => ['table' => 'provinces', 'parent' => null],
        'kabupaten_kota.csv' => ['table' => 'cities', 'parent' => 'province_id'],
        'kecamatan.csv' => ['table' => 'districts', 'parent' => 'city_id'],
        'kelurahan.csv' => ['table' => 'subdistricts', 'parent' => 'district_id'],
    ];

    /**
     * Seed the region tables from the CSV files.
     */
    public function run(): void
    {
        DB::table('subdistricts')->delete();
        DB::table('districts')->delete();
        DB::table('cities')->delete();
        DB::table('provinces')->delete();

        foreach (self::FILES as $file => $config) {
            $this->import($file, $config['table'], $config['parent']);
        }
    }

    /**
     * Import a single region CSV into its table.
     */
    private function import(string $file, string $table, ?string $parent): void
    {
        $path = Storage::disk('local')->path($file);

        if (! is_file($path)) {
            return;
        }

        $handle = fopen($path, 'r');

        if ($handle === false) {
            return;
        }

        $now = now();
        $first = true;
        $chunk = [];

        while (($row = fgetcsv($handle)) !== false) {
            if ($first) {
                $first = false;

                if (isset($row[0])) {
                    $row[0] = ltrim((string) $row[0], "\xEF\xBB\xBF");
                }

                if (strtolower(trim((string) $row[0])) === 'id') {
                    continue;
                }
            }

            $id = trim((string) ($row[0] ?? ''));
            $name = trim((string) ($row[1] ?? ''));

            if ($id === '') {
                continue;
            }

            $record = ['id' => $id, 'name' => $name, 'created_at' => $now, 'updated_at' => $now];

            if ($parent !== null) {
                $record[$parent] = substr($id, 0, (int) strrpos($id, '.'));
            }

            $chunk[] = $record;

            if (count($chunk) >= 1000) {
                DB::table($table)->insert($chunk);
                $chunk = [];
            }
        }

        if ($chunk !== []) {
            DB::table($table)->insert($chunk);
        }

        fclose($handle);
    }
}
