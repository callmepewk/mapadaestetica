/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdicionarProduto from './pages/AdicionarProduto';
import AgradecimentoCompra from './pages/AgradecimentoCompra';
import AgradecimentoPlano from './pages/AgradecimentoPlano';
import Anuncios from './pages/Anuncios';
import ArtigoBlog from './pages/ArtigoBlog';
import Blog from './pages/Blog';
import CadastrarAnuncio from './pages/CadastrarAnuncio';
import CalculadoraLaser from './pages/CalculadoraLaser';
import Checkout from './pages/Checkout';
import ControleAdmin from './pages/ControleAdmin';
import ControlePlanos from './pages/ControlePlanos';
import ControleProdutos from './pages/ControleProdutos';
import CriacaoBanner from './pages/CriacaoBanner';
import DashboardPatrocinador from './pages/DashboardPatrocinador';
import DetalhesAnuncio from './pages/DetalhesAnuncio';
import EditarAnuncio from './pages/EditarAnuncio';
import FaleConosco from './pages/FaleConosco';
import HubPontos from './pages/HubPontos';
import Inicio from './pages/Inicio';
import InstitutosAdmin from './pages/InstitutosAdmin';
import LojaPontos from './pages/LojaPontos';
import Mapa from './pages/Mapa';
import Novidades from './pages/Novidades';
import Perfil from './pages/Perfil';
import PesquisaEspecializada from './pages/PesquisaEspecializada';
import PlannerWellness from './pages/PlannerWellness';
import Produtos from './pages/Produtos';
import Radares from './pages/Radares';
import RelatorioPrecoMedio from './pages/RelatorioPrecoMedio';
import SobreNos from './pages/SobreNos';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdicionarProduto": AdicionarProduto,
    "AgradecimentoCompra": AgradecimentoCompra,
    "AgradecimentoPlano": AgradecimentoPlano,
    "Anuncios": Anuncios,
    "ArtigoBlog": ArtigoBlog,
    "Blog": Blog,
    "CadastrarAnuncio": CadastrarAnuncio,
    "CalculadoraLaser": CalculadoraLaser,
    "Checkout": Checkout,
    "ControleAdmin": ControleAdmin,
    "ControlePlanos": ControlePlanos,
    "ControleProdutos": ControleProdutos,
    "CriacaoBanner": CriacaoBanner,
    "DashboardPatrocinador": DashboardPatrocinador,
    "DetalhesAnuncio": DetalhesAnuncio,
    "EditarAnuncio": EditarAnuncio,
    "FaleConosco": FaleConosco,
    "HubPontos": HubPontos,
    "Inicio": Inicio,
    "InstitutosAdmin": InstitutosAdmin,
    "LojaPontos": LojaPontos,
    "Mapa": Mapa,
    "Novidades": Novidades,
    "Perfil": Perfil,
    "PesquisaEspecializada": PesquisaEspecializada,
    "PlannerWellness": PlannerWellness,
    "Produtos": Produtos,
    "Radares": Radares,
    "RelatorioPrecoMedio": RelatorioPrecoMedio,
    "SobreNos": SobreNos,
}

export const pagesConfig = {
    mainPage: "Inicio",
    Pages: PAGES,
    Layout: __Layout,
};