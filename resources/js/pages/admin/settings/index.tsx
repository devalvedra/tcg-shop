import { Form, Head } from '@inertiajs/react';
import { Globe, ImagePlus, Settings as SettingsIcon, Wallet, X } from 'lucide-react';
import { useRef, useState } from 'react';
import SettingsController from '@/actions/App/Http/Controllers/Admin/SettingsController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { t } from '@/lib/i18n';
import { index as settingsIndex } from '@/routes/admin/settings';

type Props = {
    settings: {
        store_name: string;
        store_email: string | null;
        store_phone: string | null;
        store_address: string | null;
        store_logo: string | null;
        store_logo_url: string | null;
        whatsapp_number: string | null;
        shipping_fee: string;
        free_shipping_threshold: string;
        locale: string;
        currency: string;
    };
};

const nativeSelectClasses =
    'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Bahasa Indonesia' },
];

const currencyOptions = [
    { value: 'usd', label: 'US Dollar ($)' },
    { value: 'idr', label: 'Rupiah (Rp)' },
];

export default function AdminSettings({ settings }: Props) {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.store_logo_url ?? null,
    );
    const [logoRemoved, setLogoRemoved] = useState(false);

    const currentLogo = logoRemoved ? null : logoPreview;

    const onLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (logoPreview) {
            URL.revokeObjectURL(logoPreview);
        }

        setLogoPreview(
            file ? URL.createObjectURL(file) : (settings.store_logo_url ?? null),
        );

        if (file) {
            setLogoRemoved(false);
        }
    };

    const removeLogo = () => {
        if (logoPreview) {
            URL.revokeObjectURL(logoPreview);
        }

        setLogoPreview(null);
        setLogoRemoved(true);

        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    return (
        <>
            <Head title={t('Settings')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <SettingsIcon className="size-6" />
                        {t('Settings')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('Configure your store details and shipping rules')}
                    </p>
                </div>

                <Form
                    {...SettingsController.update.form()}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <Card className="gap-0 py-5">
                                <CardHeader className="px-5 py-0">
                                    <CardTitle>
                                        {t('Store information')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'Shown to customers across the storefront',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 px-5 pt-6 sm:grid-cols-2">
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="store_name">
                                            {t('Store name')}
                                        </Label>
                                        <Input
                                            id="store_name"
                                            name="store_name"
                                            defaultValue={settings.store_name}
                                            placeholder="My card shop"
                                        />
                                        <InputError
                                            message={errors.store_name}
                                        />
                                    </div>

                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label>{t('Store logo')}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                'Optional. Shown in the storefront and admin headers. Recommended: a square image with a transparent background.',
                                            )}
                                        </p>

                                        {currentLogo ? (
                                            <div className="relative w-fit overflow-hidden rounded-lg border">
                                                <img
                                                    src={currentLogo}
                                                    alt={t('Store logo preview')}
                                                    className="h-20 w-20 object-contain p-1.5"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 size-6 rounded-full bg-background/80 text-rose-600 shadow-sm hover:bg-background hover:text-rose-700"
                                                    onClick={removeLogo}
                                                >
                                                    <X className="size-3.5" />
                                                    <span className="sr-only">
                                                        {t('Remove logo')}
                                                    </span>
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                                {t(
                                                    'No logo set. The default icon will be shown.',
                                                )}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-3">
                                            <Button asChild variant="outline">
                                                <label className="cursor-pointer">
                                                    <ImagePlus className="size-4" />
                                                    {currentLogo
                                                        ? t('Replace logo')
                                                        : t('Choose logo')}
                                                    <input
                                                        ref={logoInputRef}
                                                        type="file"
                                                        name="store_logo"
                                                        accept="image/*"
                                                        onChange={onLogoChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </Button>
                                        </div>

                                        {logoRemoved && (
                                            <input
                                                type="hidden"
                                                name="store_logo_remove"
                                                value="1"
                                            />
                                        )}
                                        <InputError
                                            message={errors.store_logo}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="store_email">
                                            {t('Contact email')}
                                        </Label>
                                        <Input
                                            id="store_email"
                                            name="store_email"
                                            type="email"
                                            defaultValue={
                                                settings.store_email ?? ''
                                            }
                                            placeholder="support@example.com"
                                        />
                                        <InputError
                                            message={errors.store_email}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="store_phone">
                                            {t('Contact phone')}
                                        </Label>
                                        <Input
                                            id="store_phone"
                                            name="store_phone"
                                            defaultValue={
                                                settings.store_phone ?? ''
                                            }
                                            placeholder="+63 900 000 0000"
                                        />
                                        <InputError
                                            message={errors.store_phone}
                                        />
                                    </div>

                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="store_address">
                                            {t('Address')}
                                        </Label>
                                        <Textarea
                                            id="store_address"
                                            name="store_address"
                                            defaultValue={
                                                settings.store_address ?? ''
                                            }
                                            rows={2}
                                            placeholder="Your business address"
                                        />
                                        <InputError
                                            message={errors.store_address}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="gap-0 py-5">
                                <CardHeader className="px-5 py-0">
                                    <CardTitle>{t('Notifications')}</CardTitle>
                                    <CardDescription>
                                        {t(
                                            'Used to receive order confirmations from customers',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 px-5 pt-6 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="whatsapp_number">
                                            {t('WhatsApp number')}
                                        </Label>
                                        <Input
                                            id="whatsapp_number"
                                            name="whatsapp_number"
                                            type="tel"
                                            defaultValue={
                                                settings.whatsapp_number ?? ''
                                            }
                                            placeholder="+63 900 000 0000"
                                        />
                                        <InputError
                                            message={errors.whatsapp_number}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t(
                                                'Customers are offered a WhatsApp confirmation when placing an order.',
                                            )}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="gap-0 py-5">
                                <CardHeader className="px-5 py-0">
                                    <CardTitle>{t('Shipping')}</CardTitle>
                                    <CardDescription>
                                        {t(
                                            'Used to calculate delivery costs at checkout',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 px-5 pt-6 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="shipping_fee">
                                            {t('Shipping fee')}
                                        </Label>
                                        <Input
                                            id="shipping_fee"
                                            name="shipping_fee"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            defaultValue={settings.shipping_fee}
                                        />
                                        <InputError
                                            message={errors.shipping_fee}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="free_shipping_threshold">
                                            {t('Free shipping threshold')}
                                        </Label>
                                        <Input
                                            id="free_shipping_threshold"
                                            name="free_shipping_threshold"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            defaultValue={
                                                settings.free_shipping_threshold
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors.free_shipping_threshold
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="gap-0 py-5">
                                <CardHeader className="px-5 py-0">
                                    <CardTitle>
                                        {t('Language & Currency')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'The language and currency used across the admin and storefront pages',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 px-5 pt-6 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="locale">
                                            {t('Storefront language')}
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Globe className="size-4 text-muted-foreground" />
                                            <select
                                                id="locale"
                                                name="locale"
                                                defaultValue={settings.locale}
                                                className={`w-full ${nativeSelectClasses}`}
                                                data-test="language-select"
                                            >
                                                {languageOptions.map(
                                                    (option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                        <InputError message={errors.locale} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="currency">
                                            {t('Storefront currency')}
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Wallet className="size-4 text-muted-foreground" />
                                            <select
                                                id="currency"
                                                name="currency"
                                                defaultValue={settings.currency}
                                                className={`w-full ${nativeSelectClasses}`}
                                                data-test="currency-select"
                                            >
                                                {currencyOptions.map(
                                                    (option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                        <InputError message={errors.currency} />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="save-settings-button"
                                >
                                    {t('Save settings')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AdminSettings.layout = {
    breadcrumbs: [
        {
            title: 'Settings',
            href: settingsIndex(),
        },
    ],
};
