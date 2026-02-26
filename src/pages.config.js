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
import RelatorioPrecoMedio from './pages/RelatorioPrecoMedio';
import MeuPlano from './pages/MeuPlano';
import PlannerWellness from './pages/PlannerWellness';
import MeusProdutos from './pages/MeusProdutos';
import AgradecimentoPlano from './pages/AgradecimentoPlano';
import MeusServicos from './pages/MeusServicos';
import AdicionarProduto from './pages/AdicionarProduto';
import Home from './pages/Home';
import Inicio from './pages/Inicio';
import ArtigoBlog from './pages/ArtigoBlog';
import ControleAdmin from './pages/ControleAdmin';
import CalculadoraLaser from './pages/CalculadoraLaser';
import Blog from './pages/Blog';
import MeusTratamentos from './pages/MeusTratamentos';
import LojaPontos from './pages/LojaPontos';
import ControlePlanos from './pages/ControlePlanos';
import CriacaoBanner from './pages/CriacaoBanner';
import Mapa from './pages/Mapa';
import ControleProdutos from './pages/ControleProdutos';
import SobreNos from './pages/SobreNos';
import DetalhesAnuncio from './pages/DetalhesAnuncio';
import Checkout from './pages/Checkout';
import Anuncios from './pages/Anuncios';
import PesquisaEspecializada from './pages/PesquisaEspecializada';
import AgradecimentoCompra from './pages/AgradecimentoCompra';
import Planos from './pages/Planos';
import InstitutosAdmin from './pages/InstitutosAdmin';
import Perfil from './pages/Perfil';
import Novidades from './pages/Novidades';
import Radares from './pages/Radares';
import PainelProfissional from './pages/PainelProfissional';
import HubPontos from './pages/HubPontos';
import CadastrarAnuncio from './pages/CadastrarAnuncio';
import DashboardPatrocinador from './pages/DashboardPatrocinador';
import FaleConosco from './pages/FaleConosco';
import Produtos from './pages/Produtos';
import EditarAnuncio from './pages/EditarAnuncio';
import __Layout from './Layout.jsx';


export const PAGES = {
    "RelatorioPrecoMedio": RelatorioPrecoMedio,
    "MeuPlano": MeuPlano,
    "PlannerWellness": PlannerWellness,
    "MeusProdutos": MeusProdutos,
    "AgradecimentoPlano": AgradecimentoPlano,
    "MeusServicos": MeusServicos,
    "AdicionarProduto": AdicionarProduto,
    "Home": Home,
    "Inicio": Inicio,
    "ArtigoBlog": ArtigoBlog,
    "ControleAdmin": ControleAdmin,
    "CalculadoraLaser": CalculadoraLaser,
    "Blog": Blog,
    "MeusTratamentos": MeusTratamentos,
    "LojaPontos": LojaPontos,
    "ControlePlanos": ControlePlanos,
    "CriacaoBanner": CriacaoBanner,
    "Mapa": Mapa,
    "ControleProdutos": ControleProdutos,
    "SobreNos": SobreNos,
    "DetalhesAnuncio": DetalhesAnuncio,
    "Checkout": Checkout,
    "Anuncios": Anuncios,
    "PesquisaEspecializada": PesquisaEspecializada,
    "AgradecimentoCompra": AgradecimentoCompra,
    "Planos": Planos,
    "InstitutosAdmin": InstitutosAdmin,
    "Perfil": Perfil,
    "Novidades": Novidades,
    "Radares": Radares,
    "PainelProfissional": PainelProfissional,
    "HubPontos": HubPontos,
    "CadastrarAnuncio": CadastrarAnuncio,
    "DashboardPatrocinador": DashboardPatrocinador,
    "FaleConosco": FaleConosco,
    "Produtos": Produtos,
    "EditarAnuncio": EditarAnuncio,
}

export const pagesConfig = {
    mainPage: "Inicio",
    Pages: PAGES,
    Layout: __Layout,
};