import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { name, logo } = usePage().props;

    if (logo) {
        return <img src={logo} alt={name} className="h-16 w-auto" />;
    }

    return (
        <>
            <div className="ml-1 grid flex-1 text-left text-lg">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
