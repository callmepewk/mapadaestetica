import Inicio from './pages/Inicio';
import Anuncios from './pages/Anuncios';
import DetalhesAnuncio from './pages/DetalhesAnuncio';
import Planos from './pages/Planos';
import Blog from './pages/Blog';
import SobreNos from './pages/SobreNos';
import FaleConosco from './pages/FaleConosco';
import Perfil from './pages/Perfil';
import CadastrarAnuncio from './pages/CadastrarAnuncio';
import Layout from './Layout.jsx';


export const PAGES = {
    "Inicio": Inicio,
    "Anuncios": Anuncios,
    "DetalhesAnuncio": DetalhesAnuncio,
    "Planos": Planos,
    "Blog": Blog,
    "SobreNos": SobreNos,
    "FaleConosco": FaleConosco,
    "Perfil": Perfil,
    "CadastrarAnuncio": CadastrarAnuncio,
}

export const pagesConfig = {
    mainPage: "Inicio",
    Pages: PAGES,
    Layout: Layout,
};