<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <title>{{ __('Invoice') }} {{ $order->order_number }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 28px;
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #111827;
        }
        .muted { color: #6b7280; }
        .title { font-size: 22px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
        .store-name { font-size: 18px; font-weight: bold; margin: 0 0 4px; }
        .section-title {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #6b7280;
            margin: 0 0 6px;
        }
        .meta { margin-top: 30px; }
        .meta td { vertical-align: top; padding-right: 45px; }
        .meta td:last-child { padding-right: 0; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 30px; }
        table.items th {
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #6b7280;
            border-bottom: 1px solid #e5e7eb;
            padding: 8px;
        }
        table.items td { padding: 10px 8px; border-bottom: 1px solid #f3f4f6; }
        .num { text-align: right; }
        table.totals { width: 280px; margin-left: auto; margin-top: 16px; border-collapse: collapse; }
        table.totals td { padding: 4px 0; }
        table.totals tr.grand td { border-top: 2px solid #111827; padding-top: 10px; font-size: 15px; font-weight: bold; }
        .notes { margin-top: 30px; }
    </style>
</head>
<body>
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="vertical-align: top;">
                <p class="store-name">{{ $store['name'] }}</p>
                @if ($store['address'])
                    <div class="muted">{!! nl2br(e($store['address'])) !!}</div>
                @endif
                @if ($store['email'])
                    <div class="muted">{{ $store['email'] }}</div>
                @endif
                @if ($store['phone'])
                    <div class="muted">{{ $store['phone'] }}</div>
                @endif
            </td>
            <td style="vertical-align: top; text-align: right;">
                <div class="title">{{ __('Invoice') }}</div>
                <div class="muted">#{{ $order->order_number }}</div>
                <div class="muted">{{ $order->created_at?->format('d M Y, H:i') }}</div>
            </td>
        </tr>
    </table>

    <table class="meta" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="width: 34%;">
                <p class="section-title">{{ __('Billed to') }}</p>
                <div>{{ $order->receiver_name ?? $order->customer->name }}</div>
                @if ($order->customer->phone)
                    <div class="muted">{{ $order->customer->phone }}</div>
                @endif
                @if ($order->customer->email)
                    <div class="muted">{{ $order->customer->email }}</div>
                @endif
            </td>
            <td style="width: 34%;">
                <p class="section-title">{{ __('Shipping address') }}</p>
                @if ($order->shipping_address)
                    <div>{{ $order->shipping_address }}</div>
                @endif
                <div class="muted">
                    {{ collect([$order->shipping_subdistrict, $order->shipping_district, $order->shipping_city, $order->shipping_province, $order->shipping_zip])->filter()->join(', ') }}
                </div>
            </td>
            <td style="width: 32%;">
                <p class="section-title">{{ __('Payment method') }}</p>
                <div>{{ $paymentMethod['name'] ?? ($order->payment_method ?? '—') }}</div>
                @if (($paymentMethod['account_name'] ?? null))
                    <div class="muted">{{ $paymentMethod['account_name'] }}</div>
                @endif
                @if (($paymentMethod['code'] ?? null))
                    <div class="muted">{{ $paymentMethod['code'] }}</div>
                @endif
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>{{ __('Product') }}</th>
                <th class="num">{{ __('Price') }}</th>
                <th class="num">{{ __('Qty') }}</th>
                <th class="num">{{ __('Subtotal') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }}</td>
                    <td class="num">{{ number_format((float) $item->unit_price, 2) }}</td>
                    <td class="num">{{ $item->quantity }}</td>
                    <td class="num">{{ number_format((float) $item->subtotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="muted">{{ __('Subtotal') }}</td>
            <td class="num">{{ number_format((float) $order->subtotal, 2) }}</td>
        </tr>
        @if ((float) $order->discount > 0)
            <tr>
                <td class="muted">{{ __('Discount') }}</td>
                <td class="num">-{{ number_format((float) $order->discount, 2) }}</td>
            </tr>
        @endif
        <tr>
            <td class="muted">{{ __('Shipping') }}</td>
            <td class="num">{{ number_format((float) $order->shipping_fee, 2) }}</td>
        </tr>
        <tr class="grand">
            <td>{{ __('Total') }}</td>
            <td class="num">{{ number_format((float) $order->total, 2) }}</td>
        </tr>
    </table>

    @if ($order->notes)
        <div class="notes">
            <p class="section-title">{{ __('Notes') }}</p>
            <div>{{ $order->notes }}</div>
        </div>
    @endif
</body>
</html>
