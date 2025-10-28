import Inicio from './pages/Inicio';
import Anuncios from './pages/Anuncios';
import DetalhesAnuncio from './pages/DetalhesAnuncio';
import Planos from './pages/Planos';
import Blog from './pages/Blog';
import SobreNos from './pages/SobreNos';
import Layout from './Layout.jsx';


export const PAGES = {
    "Inicio": Inicio,
    "Anuncios": Anuncios,
    "DetalhesAnuncio": DetalhesAnuncio,
    "Planos": Planos,
    "Blog": Blog,
    "SobreNos": SobreNos,
}

export const pagesConfig = {
    mainPage: "Inicio",
    Pages: PAGES,
    Layout: Layout,
};