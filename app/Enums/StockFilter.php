<?php

namespace App\Enums;

enum StockFilter: string
{
    case All = 'all';
    case InStock = 'in_stock';
}
