export interface IProducto {
  id?: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  ubicacion?: string;
  letraSaludable?: string;
  fechaCaducidad?: string;
  categoria?: string;

  cantidadSeleccionada?: number;
  unidadSeleccionada?: string;
}
