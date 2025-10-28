import Inicio from './pages/Inicio';
import Anuncios from './pages/Anuncios';
import DetalhesAnuncio from './pages/DetalhesAnuncio';
import Layout from './Layout.jsx';


export const PAGES = {
    "Inicio": Inicio,
    "Anuncios": Anuncios,
    "DetalhesAnuncio": DetalhesAnuncio,
}

export const pagesConfig = {
    mainPage: "Inicio",
    Pages: PAGES,
    Layout: Layout,
};