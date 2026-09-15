import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import {
    cities as citiesRoute,
    districts as districtsRoute,
    subdistricts as subdistrictsRoute,
} from '@/routes/regions';

export type RegionOption = {
    id: string;
    name: string;
};

type RegionField = 'province' | 'city' | 'district' | 'subdistrict';

type Props = {
    provinces: RegionOption[];
    value: {
        province: string;
        city: string;
        district: string;
        subdistrict: string;
    };
    errors?: Partial<Record<RegionField, string>>;
    onChange: (field: RegionField, value: string) => void;
};

const selectClasses =
    'mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

export function RegionFields({ provinces, value, errors, onChange }: Props) {
    const [cities, setCities] = useState<RegionOption[]>([]);
    const [districts, setDistricts] = useState<RegionOption[]>([]);
    const [subdistricts, setSubdistricts] = useState<RegionOption[]>([]);

    const provinceId =
        provinces.find((item) => item.name === value.province)?.id ?? '';
    const cityId = cities.find((item) => item.name === value.city)?.id ?? '';
    const districtId =
        districts.find((item) => item.name === value.district)?.id ?? '';

    useEffect(() => {
        if (!provinceId) {
            return;
        }

        let active = true;

        fetch(citiesRoute.url({ province: provinceId }))
            .then((response) => response.json())
            .then((data: RegionOption[]) => {
                if (active) {
                    setCities(data);
                }
            })
            .catch(() => {
                if (active) {
                    setCities([]);
                }
            });

        return () => {
            active = false;
        };
    }, [provinceId]);

    useEffect(() => {
        if (!cityId) {
            return;
        }

        let active = true;

        fetch(districtsRoute.url({ city: cityId }))
            .then((response) => response.json())
            .then((data: RegionOption[]) => {
                if (active) {
                    setDistricts(data);
                }
            })
            .catch(() => {
                if (active) {
                    setDistricts([]);
                }
            });

        return () => {
            active = false;
        };
    }, [cityId]);

    useEffect(() => {
        if (!districtId) {
            return;
        }

        let active = true;

        fetch(subdistrictsRoute.url({ district: districtId }))
            .then((response) => response.json())
            .then((data: RegionOption[]) => {
                if (active) {
                    setSubdistricts(data);
                }
            })
            .catch(() => {
                if (active) {
                    setSubdistricts([]);
                }
            });

        return () => {
            active = false;
        };
    }, [districtId]);

    const changeProvince = (id: string) => {
        const match = provinces.find((item) => item.id === id);
        setCities([]);
        setDistricts([]);
        setSubdistricts([]);
        onChange('province', match?.name ?? '');
        onChange('city', '');
        onChange('district', '');
        onChange('subdistrict', '');
    };

    const changeCity = (id: string) => {
        const match = cities.find((item) => item.id === id);
        setDistricts([]);
        setSubdistricts([]);
        onChange('city', match?.name ?? '');
        onChange('district', '');
        onChange('subdistrict', '');
    };

    const changeDistrict = (id: string) => {
        const match = districts.find((item) => item.id === id);
        setSubdistricts([]);
        onChange('district', match?.name ?? '');
        onChange('subdistrict', '');
    };

    const changeSubdistrict = (id: string) => {
        const match = subdistricts.find((item) => item.id === id);
        onChange('subdistrict', match?.name ?? '');
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1">
                <Label htmlFor="province">
                    {t('Province (EN) / Provinsi (ID)')}
                </Label>
                <select
                    id="province"
                    value={provinceId}
                    onChange={(event) => changeProvince(event.target.value)}
                    className={selectClasses}
                >
                    <option value="">{t('Select province')}</option>
                    {provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                            {province.name}
                        </option>
                    ))}
                </select>
                <InputError message={errors?.province} />
            </div>

            <div className="grid gap-1">
                <Label htmlFor="city">{t('City (EN) / Kota (ID)')}</Label>
                <select
                    id="city"
                    value={cityId}
                    disabled={!provinceId}
                    onChange={(event) => changeCity(event.target.value)}
                    className={selectClasses}
                >
                    <option value="">{t('Select city')}</option>
                    {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                            {city.name}
                        </option>
                    ))}
                </select>
                <InputError message={errors?.city} />
            </div>

            <div className="grid gap-1">
                <Label htmlFor="district">
                    {t('District (EN) / Kecamatan (ID)')}
                </Label>
                <select
                    id="district"
                    value={districtId}
                    disabled={!cityId}
                    onChange={(event) => changeDistrict(event.target.value)}
                    className={selectClasses}
                >
                    <option value="">{t('Select district')}</option>
                    {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                            {district.name}
                        </option>
                    ))}
                </select>
                <InputError message={errors?.district} />
            </div>

            <div className="grid gap-1">
                <Label htmlFor="subdistrict">
                    {t('Subdistrict (EN) / Kelurahan (ID)')}
                </Label>
                <select
                    id="subdistrict"
                    value={
                        subdistricts.find(
                            (item) => item.name === value.subdistrict,
                        )?.id ?? ''
                    }
                    disabled={!districtId}
                    onChange={(event) => changeSubdistrict(event.target.value)}
                    className={selectClasses}
                >
                    <option value="">{t('Select subdistrict')}</option>
                    {subdistricts.map((subdistrict) => (
                        <option key={subdistrict.id} value={subdistrict.id}>
                            {subdistrict.name}
                        </option>
                    ))}
                </select>
                <InputError message={errors?.subdistrict} />
            </div>
        </div>
    );
}
