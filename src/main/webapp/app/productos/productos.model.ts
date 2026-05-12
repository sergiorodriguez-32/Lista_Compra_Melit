export interface IProducto {
  id?: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  ubicacion?: string;
  letraSaludable?: string;
  fechaCaducidad?: string;
  categoria?: string;
  unidadMedida?: string;
  cantidadPorDefecto?: number;

  cantidadSeleccionada?: number;
}
