import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Eye, Database, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import MenuSuperior from '@/components/MenuSuperior';
import NewFooter from '@/components/NewFooter';
import PageLayout from '@/components/layout/PageLayout';

const PrivacyPolicy = () => {
  return (
    <PageLayout>
      <MenuSuperior />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Política de Privacidade
            </h1>
            <p className="text-lg text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lock className="h-5 w-5 text-primary" />
                  1. Informações que Coletamos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Coletamos as seguintes informações:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Dados de cadastro (nome, e-mail, telefone)</li>
                    <li>Informações de uso da plataforma</li>
                    <li>Logs de acesso e consultas realizadas</li>
                    <li>Dados de pagamento (processados por terceiros)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Eye className="h-5 w-5 text-primary" />
                  2. Como Usamos suas Informações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Utilizamos suas informações para:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Fornecer e melhorar nossos serviços</li>
                    <li>Processar pagamentos e gerenciar sua conta</li>
                    <li>Enviar comunicações importantes sobre o serviço</li>
                    <li>Cumprir obrigações legais e regulamentares</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Database className="h-5 w-5 text-primary" />
                  3. Proteção de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger 
                  suas informações pessoais contra acesso não autorizado, alteração, divulgação 
                  ou destruição não autorizada. Todos os dados são criptografados e armazenados 
                  de forma segura.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <UserCheck className="h-5 w-5 text-primary" />
                  4. Seus Direitos (LGPD)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Você tem os seguintes direitos sobre seus dados:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Acesso aos dados pessoais que tratamos</li>
                    <li>Correção de dados incompletos ou incorretos</li>
                    <li>Exclusão de dados pessoais</li>
                    <li>Portabilidade de dados</li>
                    <li>Revogação de consentimento</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/">← Voltar ao Início</Link>
            </Button>
          </div>
        </div>
      </div>
      <NewFooter />
    </PageLayout>
  );
};

export default PrivacyPolicy;
