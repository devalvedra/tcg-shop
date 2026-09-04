<?php

namespace App\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait SortableIndex
{
    /**
     * Apply a whitelisted column sort to the query.
     *
     * Returns null when no (valid) sort was supplied so the caller can apply
     * its default ordering instead. Column values may be a plain column name
     * or a closure receiving the query and the sanitized direction.
     *
     * @param  array<string, Closure|string>  $columns
     */
    protected function applySort(Request $request, Builder $query, array $columns): ?Builder
    {
        $sort = $request->input('sort');

        if (! is_string($sort) || $sort === '' || ! array_key_exists($sort, $columns)) {
            return null;
        }

        $direction = strtolower((string) $request->input('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $column = $columns[$sort];

        if ($column instanceof Closure) {
            $column($query, $direction);
        } else {
            $query->orderBy($column, $direction);
        }

        return $query;
    }
}
