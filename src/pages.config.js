import Inicio from './pages/Inicio';
import DetalhesAnuncio from './pages/DetalhesAnuncio';
import Planos from './pages/Planos';
import Blog from './pages/Blog';
import SobreNos from './pages/SobreNos';
import FaleConosco from './pages/FaleConosco';
import Perfil from './pages/Perfil';
import CadastrarAnuncio from './pages/CadastrarAnuncio';
import CalculadoraLaser from './pages/CalculadoraLaser';
import Produtos from './pages/Produtos';
import MeuPlano from './pages/MeuPlano';
import ArtigoBlog from './pages/ArtigoBlog';
import PesquisaEspecializada from './pages/PesquisaEspecializada';
import Anuncios from './pages/Anuncios';
import Layout from './Layout.jsx';


export const PAGES = {
    "Inicio": Inicio,
    "DetalhesAnuncio": DetalhesAnuncio,
    "Planos": Planos,
    "Blog": Blog,
    "SobreNos": SobreNos,
    "FaleConosco": FaleConosco,
    "Perfil": Perfil,
    "CadastrarAnuncio": CadastrarAnuncio,
    "CalculadoraLaser": CalculadoraLaser,
    "Produtos": Produtos,
    "MeuPlano": MeuPlano,
    "ArtigoBlog": ArtigoBlog,
    "PesquisaEspecializada": PesquisaEspecializada,
    "Anuncios": Anuncios,
}

export const pagesConfig = {
    mainPage: "Inicio",
    Pages: PAGES,
    Layout: Layout,
};