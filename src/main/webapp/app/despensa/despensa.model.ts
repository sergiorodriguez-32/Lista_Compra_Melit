export interface IDespensaItem {
  id?: number;
  cantidad?: number;
  unidadMedida?: string;
  tipoLista?: string;
  cantidadARestar?: number;
  cantidadASumar?: number;
  mostrarEdicion?: boolean;
  marcadoParaCompra?: boolean;
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
