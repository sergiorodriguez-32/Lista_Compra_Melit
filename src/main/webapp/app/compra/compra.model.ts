export interface ICompraItem {
  id?: number;
  cantidad?: number;
  unidadMedida?: string;
  tipoLista?: string;
  cantidadARestar?: number;
  cantidadASumar?: number;
  mostrarEdicion?: boolean;
  marcadoComoComprado?: boolean;
  producto?: {
    id?: number;
    nombre?: string;
    descripcion?: string;
    precio?: number;
    ubicacion?: string;
    letraSaludable?: string;
    fechaCaducidad?: string;
    categoria?: string;
  };
}
