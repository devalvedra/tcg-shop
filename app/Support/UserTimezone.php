<?php

namespace App\Support;

use App\Models\User;
use DateTimeZone;

class UserTimezone
{
    /**
     * The time zone user-facing dates should be shown in.
     *
     * Stored timestamps are UTC, so an unknown or missing value falls
     * back to the default instead of throwing on conversion.
     */
    public static function resolve(?User $user): string
    {
        $timezone = $user?->timezone;

        if (is_string($timezone) && in_array($timezone, DateTimeZone::listIdentifiers(), true)) {
            return $timezone;
        }

        return User::DEFAULT_TIMEZONE;
    }
}
