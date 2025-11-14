import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Shield,
  User,
  Phone,
  MessageCircle,
  MapPin,
  Instagram,
  Facebook,
  Star,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Crown,
  FileText
} from "lucide-react";



export default function ModalEditarUsuario({
  open,
  onClose,
  usuarioEditando,
  dadosEdicaoUsuario,
  setDadosEdicaoUsuario,
  onSalvar,
  isPending,
  PLANOS_INFO
}) {
  if (!usuarioEditando) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Edit className="w-6 h-6 text-pink-600" />
            Editar Usuário: {usuarioEditando.full_name}
          </DialogTitle>
          <DialogDescription>
            ⚡ Alterações serão aplicadas INSTANTANEAMENTE após salvar (reload automático)
          </DialogDescription>
        </DialogHeader>

        {isPending && (
          <Alert className="bg-blue-50 border-blue-200">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            <AlertDescription className="text-blue-800 text-sm">
              Salvando alterações... A página será recarregada automaticamente.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* SEÇÃO 1: DADOS DO CADASTRO (Readonly) */}
          <Card className="border-2 border-gray-200 bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Dados do Cadastro
              </CardTitle>
              <p className="text-xs text-gray-600">Informações preenchidas pelo usuário</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Nome Completo</Label>
                <p className="text-sm font-medium">{usuarioEditando.full_name || 'Não informado'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <p className="text-sm font-medium">{usuarioEditando.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Telefone</Label>
                  <p className="text-sm">{usuarioEditando.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">WhatsApp</Label>
                  <p className="text-sm">{usuarioEditando.whatsapp || 'Não informado'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Cidade</Label>
                  <p className="text-sm">{usuarioEditando.cidade || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Estado</Label>
                  <p className="text-sm">{usuarioEditando.estado || 'Não informado'}</p>
                </div>
              </div>
              {usuarioEditando.endereco_completo && (
                <div>
                  <Label className="text-xs text-gray-500">Endereço Completo</Label>
                  <p className="text-sm">{usuarioEditando.endereco_completo}</p>
                </div>
              )}
              {usuarioEditando.cpf && (
                <div>
                  <Label className="text-xs text-gray-500">CPF</Label>
                  <p className="text-sm">{usuarioEditando.cpf}</p>
                </div>
              )}
              {usuarioEditando.data_nascimento && (
                <div>
                  <Label className="text-xs text-gray-500">Data de Nascimento</Label>
                  <p className="text-sm">{format(new Date(usuarioEditando.data_nascimento), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              )}
              {usuarioEditando.especialidade && (
                <div>
                  <Label className="text-xs text-gray-500">Especialidade</Label>
                  <p className="text-sm">{usuarioEditando.especialidade}</p>
                </div>
              )}
              {usuarioEditando.instagram && (
                <div>
                  <Label className="text-xs text-gray-500">Instagram</Label>
                  <p className="text-sm break-all">{usuarioEditando.instagram}</p>
                </div>
              )}
              {usuarioEditando.facebook && (
                <div>
                  <Label className="text-xs text-gray-500">Facebook</Label>
                  <p className="text-sm break-all">{usuarioEditando.facebook}</p>
                </div>
              )}
              
              {/* Informações Profissionais */}
              {(usuarioEditando.tipo_usuario === 'profissional' || usuarioEditando.tipo_usuario === 'patrocinador') && (
                <>
                  {usuarioEditando.formacao && (
                    <div>
                      <Label className="text-xs text-gray-500">Formação</Label>
                      <p className="text-sm">{usuarioEditando.formacao}</p>
                    </div>
                  )}
                  {usuarioEditando.especializacao && (
                    <div>
                      <Label className="text-xs text-gray-500">Especialização</Label>
                      <p className="text-sm">{usuarioEditando.especializacao}</p>
                    </div>
                  )}
                  {usuarioEditando.tempo_formacao_anos > 0 && (
                    <div>
                      <Label className="text-xs text-gray-500">Tempo de Formação</Label>
                      <p className="text-sm">{usuarioEditando.tempo_formacao_anos} anos</p>
                    </div>
                  )}
                  {(usuarioEditando.possui_clinica || usuarioEditando.possui_ar_condicionado || usuarioEditando.possui_estacionamento || usuarioEditando.tem_google_negocios) && (
                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Recursos do Estabelecimento</Label>
                      <div className="space-y-1 text-sm">
                        {usuarioEditando.possui_clinica && <p>✓ Possui clínica própria</p>}
                        {usuarioEditando.possui_ar_condicionado && <p>✓ Ar condicionado</p>}
                        {usuarioEditando.possui_estacionamento && <p>✓ Estacionamento</p>}
                        {usuarioEditando.tem_google_negocios && <p>✓ Google Negócios</p>}
                      </div>
                    </div>
                  )}
                  {usuarioEditando.documentos_profissionais && Object.keys(usuarioEditando.documentos_profissionais).length > 0 && (
                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Documentos Enviados</Label>
                      <div className="space-y-1 text-sm">
                        {usuarioEditando.documentos_profissionais.licenca_sanitaria && (
                          <a href={usuarioEditando.documentos_profissionais.licenca_sanitaria.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                            📄 Licença Sanitária
                          </a>
                        )}
                        {usuarioEditando.documentos_profissionais.alvara_funcionamento && (
                          <a href={usuarioEditando.documentos_profissionais.alvara_funcionamento.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                            📄 Alvará de Funcionamento
                          </a>
                        )}
                        {usuarioEditando.documentos_profissionais.registro_profissional && (
                          <a href={usuarioEditando.documentos_profissionais.registro_profissional.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                            📄 Registro Profissional
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="pt-3 border-t">
                <Label className="text-xs text-gray-500">Cadastrado em</Label>
                <p className="text-sm">{format(new Date(usuarioEditando.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Cadastro Completo</Label>
                <p className="text-sm">
                  {usuarioEditando.cadastro_completo ? (
                    <Badge className="bg-green-100 text-green-800">✓ Completo</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">⚠ Incompleto</Badge>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 2: CONFIGURAÇÕES ADMIN (Editável) */}
          <Card className="border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-600" />
                Configurações Admin
              </CardTitle>
              <p className="text-xs text-pink-700">Campos editáveis - mudanças aplicadas instantaneamente</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900 text-sm">
                  <strong>⚡ ATENÇÃO:</strong> Ao salvar, as mudanças serão aplicadas IMEDIATAMENTE para o usuário!
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="editFullName">Nome Completo</Label>
                <Input
                  id="editFullName"
                  value={dadosEdicaoUsuario.full_name}
                  onChange={(e) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, full_name: e.target.value })}
                  disabled={isPending}
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editTelefone">Telefone</Label>
                  <Input
                    id="editTelefone"
                    value={dadosEdicaoUsuario.telefone}
                    onChange={(e) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, telefone: e.target.value })}
                    disabled={isPending}
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="editWhatsapp">WhatsApp</Label>
                  <Input
                    id="editWhatsapp"
                    value={dadosEdicaoUsuario.whatsapp}
                    onChange={(e) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, whatsapp: e.target.value })}
                    disabled={isPending}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-pink-200">
                <h4 className="font-semibold text-sm mb-3 text-pink-900">⚙️ Tipo e Permissões</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editTipoUsuario">Tipo de Usuário *</Label>
                    <Select
                      value={dadosEdicaoUsuario.tipo_usuario}
                      onValueChange={(value) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, tipo_usuario: value })}
                      disabled={isPending}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paciente">👤 Paciente</SelectItem>
                        <SelectItem value="profissional">💼 Profissional</SelectItem>
                        <SelectItem value="patrocinador">👑 Patrocinador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editRole">Permissão (Role)</Label>
                    <Select
                      value={dadosEdicaoUsuario.role}
                      onValueChange={(value) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, role: value })}
                      disabled={isPending}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecione a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário Comum</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="tester">Tester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-pink-200">
                <h4 className="font-semibold text-sm mb-3 text-pink-900">🎯 Planos Ativos</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="editPlanoAtivo">🗺️ Plano Mapa da Estética</Label>
                    <Select
                      value={dadosEdicaoUsuario.plano_ativo}
                      onValueChange={(value) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, plano_ativo: value })}
                      disabled={isPending}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(PLANOS_INFO).map(key => (
                          <SelectItem key={key} value={key}>{PLANOS_INFO[key].nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editPlanoClubeBeleza">👑 Clube da Beleza</Label>
                    <Select
                      value={dadosEdicaoUsuario.plano_clube_beleza}
                      onValueChange={(value) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, plano_clube_beleza: value })}
                      disabled={isPending}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Status do Clube" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhum">Nenhum</SelectItem>
                        <SelectItem value="light">LIGHT</SelectItem>
                        <SelectItem value="gold">GOLD</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editPlanoPatrocinador">🏢 Plano Patrocinador</Label>
                    <Select
                      value={dadosEdicaoUsuario.plano_patrocinador}
                      onValueChange={(value) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, plano_patrocinador: value })}
                      disabled={isPending}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Status do Patrocinador" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhum">Nenhum</SelectItem>
                        <SelectItem value="cobre">Cobre</SelectItem>
                        <SelectItem value="prata">Prata</SelectItem>
                        <SelectItem value="ouro">Ouro</SelectItem>
                        <SelectItem value="diamante">Diamante</SelectItem>
                        <SelectItem value="platina">Platina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-pink-200">
                <h4 className="font-semibold text-sm mb-3 text-pink-900">⭐ Pontos e Recompensas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editPontos">Pontos Acumulados</Label>
                    <Input
                      id="editPontos"
                      type="number"
                      value={dadosEdicaoUsuario.pontos_acumulados}
                      onChange={(e) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, pontos_acumulados: parseInt(e.target.value) || 0 })}
                      disabled={isPending}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editBeautyCoins">Beauty Coins</Label>
                    <Input
                      id="editBeautyCoins"
                      type="number"
                      value={dadosEdicaoUsuario.beauty_coins}
                      onChange={(e) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, beauty_coins: parseInt(e.target.value) || 0 })}
                      disabled={isPending}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-pink-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cadastroCompleto"
                    checked={dadosEdicaoUsuario.cadastro_completo}
                    onChange={(e) => setDadosEdicaoUsuario({ ...dadosEdicaoUsuario, cadastro_completo: e.target.checked })}
                    className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    disabled={isPending}
                  />
                  <Label htmlFor="cadastroCompleto" className="text-sm font-medium">
                    ✓ Cadastro Completo
                  </Label>
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-6">
                  Marque se o usuário completou todo o processo de cadastro
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onSalvar} 
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}