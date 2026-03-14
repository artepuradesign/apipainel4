
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, AlertTriangle, Scale, UserCheck, Lock, Ban, Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pb-8 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Termos de Uso e Responsabilidades
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
              LEIA ATENTAMENTE ANTES DE UTILIZAR A PLATAFORMA
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <Card className="border-brand-purple/20">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-brand-purple" />
                  1. Aceitação dos Termos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Ao criar uma conta, acessar ou utilizar qualquer funcionalidade do <strong>APIPainel</strong>, 
                  você declara expressamente que leu, compreendeu e concorda integralmente com todos os termos, 
                  condições e responsabilidades aqui estabelecidos. O não cumprimento destes termos resultará no 
                  bloqueio imediato da conta e possíveis medidas legais.
                </p>
              </CardContent>
            </Card>

            <Card className="border-brand-purple/20">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-brand-purple" />
                  2. Descrição do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  O APIPainel é uma plataforma tecnológica que fornece acesso a dados por meio de APIs integradas. 
                  Os serviços incluem, mas não se limitam a:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Consultas de documentos (CPF, CNPJ) através de fontes públicas e comerciais</li>
                  <li>Acesso a informações cadastrais e empresariais</li>
                  <li>Painéis administrativos e ferramentas de gestão</li>
                  <li>Sistema de créditos e saldo para realizar consultas</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
                  <strong>IMPORTANTE:</strong> O APIPainel atua exclusivamente como intermediário tecnológico, 
                  fornecendo acesso a dados obtidos de terceiros. Não geramos, validamos ou garantimos a 
                  veracidade das informações fornecidas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader className="bg-red-100 dark:bg-red-900/20">
                <CardTitle className="flex items-center gap-2 text-lg text-red-900 dark:text-red-300">
                  <AlertTriangle className="h-5 w-5" />
                  3. Responsabilidades do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-gray-800 dark:text-gray-200 font-semibold">
                    Ao utilizar o APIPainel, você é INTEGRALMENTE RESPONSÁVEL por:
                  </p>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">3.1 Uso Apropriado dos Dados</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                      <li>Utilizar os dados EXCLUSIVAMENTE para fins lícitos, legais e legítimos</li>
                      <li>Respeitar todas as leis aplicáveis, incluindo a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</li>
                      <li>Obter todas as autorizações necessárias antes de consultar ou processar dados pessoais</li>
                      <li>Manter registros de consentimento quando aplicável</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">3.2 Proibições Absolutas</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">É TERMINANTEMENTE PROIBIDO:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                      <li>Utilizar os dados para discriminação, assédio, stalking ou qualquer forma de perseguição</li>
                      <li>Revender, redistribuir ou compartilhar dados obtidos através da plataforma</li>
                      <li>Realizar consultas automatizadas, scraping ou uso massivo sem autorização expressa</li>
                      <li>Violar direitos de privacidade ou proteção de dados de terceiros</li>
                      <li>Utilizar para fraudes, golpes, crimes financeiros ou qualquer atividade ilícita</li>
                      <li>Compartilhar credenciais de acesso com terceiros</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">3.3 Conformidade Legal</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                      <li>Cumprir integralmente com a LGPD (Lei 13.709/2018)</li>
                      <li>Respeitar o Marco Civil da Internet (Lei 12.965/2014)</li>
                      <li>Observar o Código de Defesa do Consumidor (Lei 8.078/1990)</li>
                      <li>Cumprir demais legislações aplicáveis à sua atividade</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/30">
              <CardHeader className="bg-orange-50 dark:bg-orange-900/10">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scale className="h-5 w-5 text-orange-600" />
                  4. Limitação Total de Responsabilidade da Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-gray-800 dark:text-gray-200 font-semibold">
                    O APIPainel NÃO SE RESPONSABILIZA, EM HIPÓTESE ALGUMA, POR:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300 ml-4">
                    <li><strong>Uso indevido dos dados:</strong> O usuário é o único responsável pela forma como utiliza as informações obtidas</li>
                    <li><strong>Violações legais:</strong> Qualquer descumprimento de leis de proteção de dados, privacidade ou outras normas</li>
                    <li><strong>Danos a terceiros:</strong> Prejuízos materiais, morais ou de qualquer natureza causados a terceiros pelo uso dos dados</li>
                    <li><strong>Precisão dos dados:</strong> Os dados são obtidos de fontes terceiras e não garantimos sua atualização, completude ou exatidão</li>
                    <li><strong>Interrupções do serviço:</strong> Indisponibilidade temporária ou permanente das APIs integradas</li>
                    <li><strong>Decisões baseadas nos dados:</strong> Quaisquer decisões comerciais, financeiras ou pessoais tomadas com base nas informações</li>
                    <li><strong>Ações legais:</strong> Processos, multas ou sanções decorrentes do uso inadequado dos dados pelo usuário</li>
                  </ul>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 mt-4">
                    <p className="text-gray-800 dark:text-gray-200 font-semibold">
                      ⚠️ ATENÇÃO: Você reconhece e concorda expressamente que o uso do APIPainel é por sua 
                      conta e risco. Em nenhuma circunstância a plataforma, seus proprietários, funcionários 
                      ou parceiros serão responsabilizados por quaisquer danos diretos, indiretos, incidentais, 
                      especiais, consequenciais ou punitivos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-brand-purple/20">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCheck className="h-5 w-5 text-brand-purple" />
                  5. Direitos e Deveres do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Direitos:</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                      <li>Acesso aos serviços contratados conforme o plano escolhido</li>
                      <li>Suporte técnico nos termos estabelecidos</li>
                      <li>Solicitação de exclusão de dados pessoais (direito ao esquecimento)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Deveres:</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                      <li>Fornecer informações verdadeiras e atualizadas no cadastro</li>
                      <li>Manter a segurança de suas credenciais de acesso</li>
                      <li>Notificar imediatamente qualquer uso não autorizado de sua conta</li>
                      <li>Utilizar a plataforma de boa-fé e para fins legítimos</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-brand-purple/20">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-brand-purple" />
                  6. Privacidade e Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Coletamos e processamos dados pessoais necessários para o fornecimento dos serviços. 
                  Para informações detalhadas sobre como tratamos seus dados, consulte nossa 
                  <Link to="/privacy" className="text-brand-purple hover:underline font-medium mx-1">
                    Política de Privacidade
                  </Link>.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Implementamos medidas de segurança técnicas e administrativas para proteger os dados, 
                  mas você reconhece que nenhum sistema é 100% seguro.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader className="bg-red-100 dark:bg-red-900/20">
                <CardTitle className="flex items-center gap-2 text-lg text-red-900 dark:text-red-300">
                  <Ban className="h-5 w-5" />
                  7. Suspensão e Cancelamento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-800 dark:text-gray-200 font-semibold mb-4">
                  A plataforma se reserva o direito de suspender ou cancelar sua conta IMEDIATAMENTE, 
                  sem aviso prévio, nas seguintes situações:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Violação de qualquer termo deste acordo</li>
                  <li>Uso suspeito ou fraudulento da plataforma</li>
                  <li>Tentativa de burlar sistemas de segurança</li>
                  <li>Não pagamento de valores devidos</li>
                  <li>Reclamações de terceiros sobre uso indevido de dados</li>
                  <li>Ordem judicial ou solicitação de autoridades competentes</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
                  <strong>Importante:</strong> Em caso de cancelamento por violação, não haverá reembolso 
                  de valores pagos e você permanecerá responsável por todas as obrigações assumidas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-brand-purple/20">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gavel className="h-5 w-5 text-brand-purple" />
                  8. Disposições Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p><strong>8.1 Lei Aplicável:</strong> Este termo é regido pelas leis da República Federativa do Brasil.</p>
                  
                  <p><strong>8.2 Foro:</strong> Fica eleito o foro da comarca de [Sua Cidade] para dirimir quaisquer 
                  controvérsias decorrentes deste termo.</p>
                  
                  <p><strong>8.3 Alterações:</strong> Reservamo-nos o direito de modificar estes termos a qualquer 
                  momento. As alterações entram em vigor imediatamente após publicação. O uso continuado da 
                  plataforma constitui aceitação das modificações.</p>
                  
                  <p><strong>8.4 Indivisibilidade:</strong> Se qualquer cláusula deste termo for considerada inválida, 
                  as demais permanecerão em pleno vigor.</p>
                  
                  <p><strong>8.5 Indenização:</strong> Você concorda em indenizar, defender e isentar o APIPainel, 
                  seus proprietários e funcionários de quaisquer reivindicações, danos, obrigações, perdas, 
                  responsabilidades, custos ou dívidas decorrentes do seu uso da plataforma.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-brand-purple bg-brand-purple/5">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-gray-900 dark:text-white font-bold text-lg text-center">
                    DECLARAÇÃO DE CIÊNCIA E CONCORDÂNCIA
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                    Ao utilizar o APIPainel, você declara que leu, compreendeu e concorda integralmente 
                    com todos os termos e condições aqui estabelecidos, assumindo total responsabilidade 
                    pelo uso que fizer dos dados e serviços disponibilizados pela plataforma.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
                    Para dúvidas ou esclarecimentos, entre em contato através dos nossos canais oficiais de suporte.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão Voltar */}
          <div className="text-center mt-12 space-y-4">
            <Button asChild size="lg" className="bg-brand-purple hover:bg-brand-darkPurple">
              <Link to="/">Voltar ao Início</Link>
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} APIPainel. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
