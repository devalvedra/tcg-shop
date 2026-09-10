<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\SortableIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBannerRequest;
use App\Http\Requests\Admin\UpdateBannerRequest;
use App\Models\Banner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    use SortableIndex;

    /**
     * The maximum rendered width for the desktop banner variant.
     */
    private const int DESKTOP_WIDTH = 1920;

    /**
     * The maximum rendered width for the mobile banner variant.
     */
    private const int MOBILE_WIDTH = 768;

    /**
     * The WebP quality used when normalizing banner uploads.
     */
    private const int IMAGE_QUALITY = 80;

    /**
     * Show a paginated list of banners.
     */
    public function index(Request $request): Response
    {
        $banners = Banner::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search'));

                $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('is_active', $request->input('status') === 'active');
            });

        $banners = $this->applySort($request, $banners, [
            'title' => 'title',
            'sort_order' => 'sort_order',
            'link' => 'link_url',
            'status' => 'is_active',
        ]) ?? $banners->orderBy('sort_order')->orderByDesc('created_at');

        $banners = $banners->paginate(10)->withQueryString();

        return Inertia::render('admin/banners/index', [
            'banners' => $banners,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form to create a new banner.
     */
    public function create(): Response
    {
        return Inertia::render('admin/banners/create');
    }

    /**
     * Store a newly created banner.
     */
    public function store(StoreBannerRequest $request): RedirectResponse
    {
        $banner = Banner::create($request->safe()->except(['image']));

        if ($request->hasFile('image')) {
            $paths = $this->storeBannerImages($request->file('image'));
            $banner->update($paths);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.banner_created')]);

        return to_route('admin.banners.show', $banner);
    }

    /**
     * Show the detail page for an existing banner.
     */
    public function show(Banner $banner): Response
    {
        return Inertia::render('admin/banners/show', [
            'banner' => $banner,
        ]);
    }

    /**
     * Show the form to edit an existing banner.
     */
    public function edit(Banner $banner): Response
    {
        return Inertia::render('admin/banners/edit', [
            'banner' => $banner,
        ]);
    }

    /**
     * Update the given banner.
     */
    public function update(UpdateBannerRequest $request, Banner $banner): RedirectResponse
    {
        $banner->update($request->safe()->except(['image']));

        if ($request->hasFile('image')) {
            $this->deleteBannerImages($banner);

            $banner->update($this->storeBannerImages($request->file('image')));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.banner_updated')]);

        return to_route('admin.banners.show', $banner);
    }

    /**
     * Delete the given banner.
     */
    public function destroy(Banner $banner): RedirectResponse
    {
        $this->deleteBannerImages($banner);

        $banner->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.banner_deleted')]);

        return to_route('admin.banners.index');
    }

    /**
     * Normalize an uploaded banner into desktop and mobile WebP variants.
     *
     * @return array{image: string, image_mobile: string}
     */
    private function storeBannerImages(UploadedFile $file): array
    {
        $source = $this->decodeImage($file);

        if ($source === null) {
            $path = $file->store('banners', 'public');

            if ($path === false) {
                throw new \RuntimeException('Could not store the banner image.');
            }

            return ['image' => $path, 'image_mobile' => $path];
        }

        try {
            $desktop = $this->storeVariant($source, self::DESKTOP_WIDTH);
            $mobile = $this->storeVariant($source, self::MOBILE_WIDTH);

            return ['image' => $desktop, 'image_mobile' => $mobile];
        } finally {
            imagedestroy($source);
        }
    }

    /**
     * Decode an uploaded image into a GD resource, or null when it cannot
     * be decoded.
     *
     * @return \GdImage|null
     */
    private function decodeImage(UploadedFile $file)
    {
        $path = $file->getRealPath();

        if ($path === false) {
            return null;
        }

        return match (strtolower($file->getClientOriginalExtension())) {
            'png' => @imagecreatefrompng($path) ?: null,
            'gif' => @imagecreatefromgif($path) ?: null,
            'webp' => @imagecreatefromwebp($path) ?: null,
            default => @imagecreatefromjpeg($path) ?: null,
        };
    }

    /**
     * Downscale and encode a variant of the given image as WebP.
     */
    private function storeVariant(\GdImage $source, int $maxWidth): string
    {
        $limit = max(1, $maxWidth);
        $sourceWidth = imagesx($source);

        $scaled = $sourceWidth > $limit
            ? imagescale($source, $limit, -1)
            : $source;

        if ($scaled === false) {
            throw new \RuntimeException('Could not scale the banner image.');
        }

        ob_start();
        imagewebp($scaled, null, self::IMAGE_QUALITY);
        $contents = (string) ob_get_clean();

        if ($scaled !== $source) {
            imagedestroy($scaled);
        }

        $name = 'banners/'.Str::uuid().'.webp';
        Storage::disk('public')->put($name, $contents);

        return $name;
    }

    /**
     * Delete the stored images belonging to a banner.
     */
    private function deleteBannerImages(Banner $banner): void
    {
        foreach ([$banner->image, $banner->image_mobile] as $path) {
            if ($path) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
