import styles from "@/styles/pages/terms.module.css";
import MainLayout from "@/layout/MainLayout";
import Link from "next/link";
import CustomHead from "@/components/CustomHead";

export default function Privacy() {

  return (
    <>
      <CustomHead
        pageTitle="Terra Média - Política de Privacidade"
        pageDescription="Saiba como o Terra Média coleta, usa e protege suas informações pessoais em nossa loja online."
        pageUrl="https://smpraiz.com.br/privacy"
      />

      <MainLayout>

        <main className={styles.main}>
          
          <h1>Política de Privacidade</h1>

          <div className={styles.container}>
            <p>
              Sua privacidade é muito importante para nós. É política do servidor respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar em nossa loja e outros sites que operamos.
            </p>
            <p>
              Coletamos informações pessoais somente quando necessário, sempre com seu consentimento e total transparência. Explicamos claramente o motivo da coleta e como esses dados serão utilizados.
            </p>
            <p>
              As informações coletadas são armazenadas apenas pelo tempo necessário para fornecer os serviços solicitados. Adotamos medidas de segurança comerciais aceitáveis para proteger seus dados contra perda, roubo, acesso não autorizado, divulgação, cópia ou modificação indevida.
            </p>
            <p>
              Jamais compartilhamos suas informações pessoais publicamente ou com terceiros, exceto quando legalmente exigido ou quando necessário para funcionamento dos serviços (ex.: integração com Mercado Pago).
            </p>
            <p>
              Nosso site pode conter links para sites externos que não são de nossa responsabilidade. Recomendamos que você leia as respectivas políticas de privacidade desses sites ao acessá-los.
            </p>
            <p>
              O uso contínuo ou realização de qualquer compra em nosso site será considerado como aceitação das nossas práticas de privacidade. Se tiver dúvidas sobre como tratamos dados pessoais, entre em contato conosco no <Link href={'/discord'}>Discord do Terra Média</Link> antes de usar a loja.
            </p>
          </div>

        </main>

      </MainLayout>
    </>
  );
}
