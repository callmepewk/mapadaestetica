import Inicio from './pages/Inicio';
import Anuncios from './pages/Anuncios';
import Layout from './Layout.jsx';


export const PAGES = {
    "Inicio": Inicio,
    "Anuncios": Anuncios,
}

export const pagesConfig = {
    mainPage: "Inicio",
    Pages: PAGES,
    Layout: Layout,
};