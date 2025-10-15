import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, UserCog, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";

// Tipos do formulário de Perfil
type ProfileForm = {
  fullName: string;
  cpf?: string;
  phone?: string;
  birthDate?: string; // yyyy-mm-dd
};

// Tipos do formulário de Senha
type PasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

const AccountData = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "perfil";
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const defaultValues = useMemo<ProfileForm>(() => {
    return {
      fullName: `${user?.user_metadata?.first_name || ""} ${user?.user_metadata?.last_name || ""}`.trim(),
      cpf: "",
      phone: "",
      birthDate: "",
    };
  }, [user]);

  const form = useForm<ProfileForm>({
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const onSubmitProfile = async (values: ProfileForm) => {
    try {
      // TODO: Implementar chamada para API Django para atualizar perfil
      toast.info("Funcionalidade em desenvolvimento", { description: "A atualização de perfil será implementada em breve." });
    } catch (error) {
      toast.error("Erro ao salvar", { description: "Não foi possível atualizar o perfil." });
    }
  };

  const pwdForm = useForm<PasswordForm>({ defaultValues: { newPassword: "", confirmPassword: "" } });

  const validatePassword = (pwd: string) => {
    const rules = [
      /[A-Z]/.test(pwd),
      /[a-z]/.test(pwd),
      /\d/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd),
      pwd.length >= 8,
    ];
    return rules.every(Boolean);
  };

  const onSubmitPassword = async (values: PasswordForm) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.warning("As senhas não coincidem", { description: "Verifique e tente novamente." });
      return;
    }
    if (!validatePassword(values.newPassword)) {
      toast.warning("Senha fraca", { description: "Siga os requisitos mínimos de segurança." });
      return;
    }

    try {
      // TODO: Implementar chamada para API Django para alterar senha
      toast.info("Funcionalidade em desenvolvimento", { description: "A alteração de senha será implementada em breve." });
      pwdForm.reset();
    } catch (error) {
      toast.error("Erro ao alterar senha", { description: "Não foi possível alterar a senha." });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    setSearchParams(params, { replace: true });
  };

  const displayName = `${user?.user_metadata?.first_name || ""} ${user?.user_metadata?.last_name || ""}`.trim() || user?.email?.split("@")[0] || "Investidor";

  const since = "—"; // TODO: Implementar data de criação da conta

  return (
    <div className="min-h-screen">
      <SEO
        title="Dados da Conta — investorion.com.br"
        description="Gerencie seu perfil, privacidade e senha com segurança."
        canonical="/conta/dados"
      />

      <header className="border-b bg-card/30">
        <div className="container py-6">
          <h1 className="text-2xl font-semibold tracking-tight">Dados da Conta</h1>
          <p className="text-sm text-muted-foreground">Olá, {displayName} • Usuário desde {since}</p>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <BackButton />
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="perfil" className="gap-2"><UserCog className="h-4 w-4" /> Perfil</TabsTrigger>
            <TabsTrigger value="privacidade" className="gap-2"><ShieldCheck className="h-4 w-4" /> Privacidade</TabsTrigger>
            <TabsTrigger value="senha" className="gap-2"><KeyRound className="h-4 w-4" /> Alterar Senha</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="focus:outline-none">
            <section aria-labelledby="perfil-heading" className="mt-4">
              <h2 id="perfil-heading" className="sr-only">Editar perfil</h2>
              <Card className="rounded-xl">
                <CardContent className="p-6 space-y-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitProfile)} className="grid gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        rules={{ required: "Informe seu nome completo" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input placeholder="000.000.000-00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="(00) 00000-0000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>E-mail</Label>
                          <Input value={user?.email ?? ""} readOnly />
                          <p className="text-xs text-muted-foreground">O e-mail é gerenciado pela autenticação e não pode ser alterado aqui.</p>
                        </div>
                        <FormField
                          control={form.control}
                          name="birthDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de nascimento</FormLabel>
                              <FormControl>
                                <Input type="date" placeholder="aaaa-mm-dd" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit">Salvar alterações</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="privacidade" className="focus:outline-none">
            <section aria-labelledby="privacy-heading" className="mt-4">
              <h2 id="privacy-heading" className="sr-only">Política de Privacidade e Uso</h2>
              <div className="grid gap-4">
                <Card className="rounded-xl">
                  <CardContent className="p-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Privacidade e uso</span>
                    </div>
                    <p className="text-sm">Leia e entenda nossas diretrizes de privacidade e uso de dados. Mantemos seus dados seguros e utilizamos apenas para oferecer os serviços da plataforma.</p>
                    <a className="underline text-primary text-sm" href="mailto:dpo@investorion.com.br">Falar com o DPO</a>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="senha" className="focus:outline-none">
            <section aria-labelledby="password-heading" className="mt-4">
              <h2 id="password-heading" className="sr-only">Alterar senha</h2>
              <Card className="rounded-xl">
                <CardContent className="p-6 space-y-6">
                  <Form {...pwdForm}>
                    <form onSubmit={pwdForm.handleSubmit(onSubmitPassword)} className="grid gap-6">
                      <FormField
                        control={pwdForm.control}
                        name="newPassword"
                        rules={{ required: "Informe a nova senha" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nova senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={pwdForm.control}
                        name="confirmPassword"
                        rules={{ required: "Confirme a nova senha" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar nova senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Mínimo de 8 caracteres</li>
                        <li>• Pelo menos 1 letra maiúscula e 1 minúscula</li>
                        <li>• Pelo menos 1 número e 1 caractere especial</li>
                        <li>• As senhas devem ser iguais</li>
                      </ul>

                      <div className="flex justify-end">
                        <Button type="submit">Confirmar</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AccountData;