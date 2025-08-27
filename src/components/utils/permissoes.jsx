import { User, Papel, Empresa } from "@/api/entities";

export const isSuperAdmin = async (userId) => {
  try {
    const users = await User.filter({ id: userId });
    if (!users || users.length === 0 || !users[0].papel_id) {
      return false;
    }
    const papeis = await Papel.filter({ id: users[0].papel_id });
    return papeis.length > 0 && papeis[0].tipo === 'super_admin';
  } catch (error) {
    console.error('Erro ao verificar Super Admin:', error);
    return false;
  }
};

export const getEmpresasComAcesso = async (userId) => {
  try {
    const users = await User.filter({ id: userId });
    if (users.length === 0) return [];

    const currentUser = users[0];
    const papeis = currentUser.papel_id ? await Papel.filter({ id: currentUser.papel_id }) : [];
    
    if (papeis.length > 0 && papeis[0].tipo === 'super_admin') {
      return await Empresa.list('-created_date');
    } else if (currentUser.empresa_id) {
      const empresas = await Empresa.filter({ id: currentUser.empresa_id });
      return empresas;
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar empresas com acesso:', error);
    return [];
  }
};