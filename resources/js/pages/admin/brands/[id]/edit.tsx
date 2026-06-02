interface Props {
    id: number;
}

export default function AdminBrandsEdit({ id }: Props) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Editar marca #{id}</h1>
            <p className="mt-4 text-muted-foreground">
                Formulario de edición — implementación pendiente.
            </p>
        </div>
    );
}
