export interface IAdminUser {
  id?: number;
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  activated?: boolean;
  langKey?: string;
  authorities?: string[];

  mostrarEdicion?: boolean;

  editFirstName?: string;
  editLastName?: string;
  editEmail?: string;
  editLangKey?: string;
  editActivated?: boolean;
  editAuthorities?: string[];
}
