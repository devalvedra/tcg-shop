import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import type { Banner } from '@/types';

type Props = {
    banners: Banner[];
};

export function StoreBannerCarousel({ banners }: Props) {
    const [current, setCurrent] = useState(0);

    const count = banners.length;

    const goTo = useCallback(
        (index: number) => setCurrent((index + count) % count),
        [count],
    );

    useEffect(() => {
        if (count <= 1) {
            return;
        }

        const timer = window.setInterval(() => {
            setCurrent((index) => (index + 1) % count);
        }, 6000);

        return () => window.clearInterval(timer);
    }, [count]);

    if (count === 0) {
        return null;
    }

    const banner = banners[current];

    const content = (
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col items-start justify-center gap-3 px-4 py-14 text-white md:px-6 md:py-20">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/25">
                <Sparkles className="size-3.5" />
                {t('Featured')}
            </span>
            <h2 className="max-w-2xl text-2xl font-semibold tracking-tight md:text-4xl">
                {banner.title}
            </h2>
            {banner.subtitle && (
                <p className="max-w-xl text-sm text-white/80 md:text-base">
                    {banner.subtitle}
                </p>
            )}
            {banner.link_url && (
                <a
                    href={banner.link_url}
                    className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-indigo-700 shadow-lg transition-colors hover:bg-indigo-50"
                >
                    {t('Shop now')}
                    <ArrowRight className="size-4" />
                </a>
            )}
        </div>
    );

    return (
        <section className="relative w-full overflow-hidden">
            <div
                className="transition-transform duration-500"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                <div className="flex">
                    {banners.map((item, bannerIndex) => (
                        <div key={item.id} className="relative w-full shrink-0">
                            {item.url ? (
                                <div className="relative aspect-[3/2] w-full sm:aspect-[21/7]">
                                    <img
                                        src={item.url}
                                        srcSet={
                                            item.mobile_url &&
                                            item.mobile_url !== item.url
                                                ? `${item.mobile_url} 768w, ${item.url} 1920w`
                                                : undefined
                                        }
                                        sizes="100vw"
                                        alt={item.title}
                                        loading={
                                            bannerIndex === 0 ? 'eager' : 'lazy'
                                        }
                                        decoding="async"
                                        fetchPriority={
                                            bannerIndex === 0 ? 'high' : 'auto'
                                        }
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/85 via-indigo-900/40 to-transparent" />
                                    {item.title === banner.title ? (
                                        <div className="absolute inset-0">
                                            {content}
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="relative aspect-[3/2] w-full bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 sm:aspect-[21/7]">
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute -top-16 -right-16 size-72 rounded-full bg-white/10 blur-3xl"
                                    />
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-indigo-400/30 blur-3xl"
                                    />
                                    {item.title === banner.title ? (
                                        <div className="absolute inset-0">
                                            {content}
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {count > 1 && (
                <>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 left-3 hidden size-9 -translate-y-1/2 rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/25 hover:text-white md:inline-flex"
                        onClick={() => goTo(current - 1)}
                    >
                        <ArrowLeft className="size-4" />
                        <span className="sr-only">{t('Previous banner')}</span>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-3 hidden size-9 -translate-y-1/2 rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/25 hover:text-white md:inline-flex"
                        onClick={() => goTo(current + 1)}
                    >
                        <ArrowRight className="size-4" />
                        <span className="sr-only">{t('Next banner')}</span>
                    </Button>
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                        {banners.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                aria-label={t('Go to banner {index}', {
                                    index: index + 1,
                                })}
                                className={`h-1.5 rounded-full transition-all ${
                                    index === current
                                        ? 'w-6 bg-white'
                                        : 'w-1.5 bg-white/50 hover:bg-white/75'
                                }`}
                                onClick={() => goTo(index)}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
