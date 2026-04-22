export interface IDespensaItem {
  id?: number;
  cantidad?: number;
  tipoLista?: string;
  producto?: {
    id?: number;
    nombre?: string;
    descripcion?: string;
    precio?: number;
    ubicacion?: string;
    letraSaludable?: string;
    fechaCaducidad?: string;
  };
}
