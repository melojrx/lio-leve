import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, UserCog, KeyRound, Loader2 } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileFormValues = {
  full_name: string;
  cpf: string;
  phone: string;
  birth_date: string;
};

// Funções de máscara
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

const AccountData = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "perfil";
  
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>();

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        cpf: profile.cpf ? maskCPF(profile.cpf) : '',
        phone: profile.phone ? maskPhone(profile.phone) : '',
        birth_date: profile.birth_date || '',
      });
    }
  }, [profile, form]);

  const handleAvatarUpload = (newUrl: string) => {
    updateProfile.mutate({ avatar_url: newUrl });
  };

  const onSubmitProfile = (values: ProfileFormValues) => {
    const unmaskedValues = {
      ...values,
      cpf: (values.cpf || '').replace(/\D/g, ''),
      phone: (values.phone || '').replace(/\D/g, ''),
    };
    updateProfile.mutate(unmaskedValues);
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  if (isLoadingProfile) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title="Dados da Conta — investorion.com.br"
        description="Gerencie seu perfil, privacidade e senha com segurança."
        canonical="/conta/dados"
      />

      <header className="border-b bg-card/30">
        <div className="container py-6">
          <BackButton />
          <h1 className="text-2xl font-semibold tracking-tight mt-4">Dados da Conta</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas informações pessoais e de segurança.</p>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <Tabs value={tabParam} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="perfil" className="gap-2"><UserCog className="h-4 w-4" /> Perfil</TabsTrigger>
            <TabsTrigger value="seguranca" className="gap-2"><KeyRound className="h-4 w-4" /> Segurança</TabsTrigger>
            <TabsTrigger value="privacidade" className="gap-2"><ShieldCheck className="h-4 w-4" /> Privacidade</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="mt-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-8 md:grid-cols-3">
                <AvatarUpload
                  currentAvatarUrl={profile?.avatar_url}
                  onUploadSuccess={handleAvatarUpload}
                  fallbackName={profile?.full_name || user?.email || ''}
                />
                <div className="md:col-span-2">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
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
                              <FormControl><Input {...field} onChange={e => field.onChange(maskCPF(e.target.value))} /></FormControl>
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
                              <FormControl><Input {...field} onChange={e => field.onChange(maskPhone(e.target.value))} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de nascimento</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input value={user?.email ?? ""} disabled />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={updateProfile.isPending}>
                          {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Salvar alterações
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Segurança</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Funcionalidade de alteração de senha em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacidade" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Privacidade e Uso de Dados</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Leia e entenda nossas diretrizes de privacidade e uso de dados. Mantemos seus dados seguros e utilizamos apenas para oferecer os serviços da plataforma.</p>
                <Button variant="link" asChild className="p-0"><a href="mailto:dpo@investorion.com.br">Falar com o DPO</a></Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AccountData;