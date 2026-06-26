<?php

namespace App\Enums;

enum ProductImageAction: string
{
    case Uploaded = 'Imagen subida exitosamente.';
    case Reordered = 'Imágenes reordenadas.';
    case CoverSet = 'Imagen de portada actualizada.';
    case Deleted = 'Imagen eliminada.';
}
