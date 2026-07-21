<?php

namespace App\Enums;

enum ImportStatus: string
{
    case Imported = 'imported';
    case Skipped = 'skipped';
    case Failed = 'failed';
}
