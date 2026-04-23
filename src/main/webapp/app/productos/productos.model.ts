export interface IProducto {
  id?: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  ubicacion?: string;
  letraSaludable?: string;
  fechaCaducidad?: string;

  cantidadSeleccionada?: number;
  unidadSeleccionada?: string;
}
