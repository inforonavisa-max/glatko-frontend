/**
 * G-AUTH-3 / G-DELIVERABILITY-1: Localized copy for the 5 transactional auth emails.
 *
 * Each namespace shares the same shape. Variables:
 *   - {firstName} — substituted from user_metadata.first_name (fallback: email local part)
 *   - {code}      — substituted from email_data.token (only used by reauthentication.intro)
 *
 * Subject lines use a "Glatko:" brand prefix across every locale to lift Gmail
 * trust signals and resolve the "no brand identity" SpamAssassin flag.
 *
 * No English fallback — every locale is fully translated.
 */
import type { EmailLocale } from "@/lib/email/templates/translations";

export type AuthEmailType =
  | "recovery"
  | "signup"
  | "magiclink"
  | "email_change"
  | "reauthentication";

type AuthEmailCopy = {
  subject: string;
  preheader: string;
  heading: string;
  intro: string;
  cta: string;
  expiry: string;
  ignoreNote: string;
  signature: string;
};

type AuthCommonCopy = {
  /** Used only by the reauth template — label above the OTP code box. */
  codeLabel: string;
};

export type AuthTranslations = Record<AuthEmailType, AuthEmailCopy> & {
  common: AuthCommonCopy;
};

export const authTranslations: Record<EmailLocale, AuthTranslations> = {
  me: {
    recovery: {
      subject: "Glatko: Resetujte svoju lozinku",
      preheader: "Kliknite na link u nastavku da resetujete vašu Glatko lozinku.",
      heading: "Resetujte svoju lozinku",
      intro:
        "Pozdrav {firstName}, primili smo zahtjev za resetovanje lozinke za vaš Glatko nalog. Kliknite na dugme ispod da postavite novu lozinku.",
      cta: "Resetuj lozinku",
      expiry: "Ovaj link je važeći narednih 60 minuta.",
      ignoreNote:
        "Ako niste vi tražili resetovanje, slobodno zanemarite ovaj email — vaša lozinka ostaje nepromijenjena.",
      signature: "Glatko tim",
    },
    signup: {
      subject: "Glatko: Potvrdite vaš email",
      preheader: "Jedan korak do aktivacije vašeg Glatko naloga.",
      heading: "Dobrodošli na Glatko",
      intro:
        "Pozdrav {firstName}, hvala što ste se registrovali na Glatko. Da biste aktivirali svoj nalog, potvrdite email klikom na dugme ispod.",
      cta: "Potvrdi email",
      expiry: "Ovaj link je važeći narednih 24 sata.",
      ignoreNote:
        "Ako se niste registrovali na Glatko, slobodno zanemarite ovaj email.",
      signature: "Glatko tim",
    },
    magiclink: {
      subject: "Glatko: Vaš link za prijavu",
      preheader: "Kliknite za sigurnu prijavu bez lozinke.",
      heading: "Prijavite se na Glatko",
      intro:
        "Pozdrav {firstName}, kliknite na dugme ispod da se prijavite na Glatko bez unosa lozinke.",
      cta: "Prijavite se",
      expiry: "Ovaj link je važeći narednih 60 minuta.",
      ignoreNote:
        "Ako niste vi tražili prijavu, slobodno zanemarite ovaj email.",
      signature: "Glatko tim",
    },
    email_change: {
      subject: "Glatko: Potvrdite promjenu email adrese",
      preheader: "Potvrdite vašu novu email adresu za Glatko nalog.",
      heading: "Potvrdite novu email adresu",
      intro:
        "Pozdrav {firstName}, primili smo zahtjev za promjenu email adrese vašeg Glatko naloga. Kliknite ispod da potvrdite novu adresu.",
      cta: "Potvrdi novu adresu",
      expiry: "Ovaj link je važeći narednih 24 sata.",
      ignoreNote:
        "Ako niste tražili promjenu email adrese, kontaktirajte podršku odmah.",
      signature: "Glatko tim",
    },
    reauthentication: {
      subject: "Glatko: Potvrdite vaš identitet",
      preheader: "Sigurnosna potvrda za nastavak osjetljive radnje.",
      heading: "Potvrdite identitet",
      intro:
        "Pozdrav {firstName}, da biste izvršili ovu osjetljivu radnju, unesite kod ispod u Glatko aplikaciji: {code}",
      cta: "Otvori Glatko",
      expiry: "Ovaj kod je važeći narednih 10 minuta.",
      ignoreNote:
        "Ako niste vi tražili ovo, neko možda pokušava pristupiti vašem nalogu — odmah promijenite lozinku.",
      signature: "Glatko tim",
    },
    common: { codeLabel: "Vaš kod za potvrdu" },
  },

  sr: {
    recovery: {
      subject: "Glatko: Resetujte svoju lozinku",
      preheader: "Kliknite na link ispod da resetujete vašu Glatko lozinku.",
      heading: "Resetujte svoju lozinku",
      intro:
        "Pozdrav {firstName}, primili smo zahtev za resetovanje lozinke za vaš Glatko nalog. Kliknite na dugme ispod da postavite novu lozinku.",
      cta: "Resetuj lozinku",
      expiry: "Ovaj link važi narednih 60 minuta.",
      ignoreNote:
        "Ako niste vi zatražili resetovanje, zanemarite ovaj email — lozinka ostaje nepromenjena.",
      signature: "Glatko tim",
    },
    signup: {
      subject: "Glatko: Potvrdite vaš email",
      preheader: "Jedan korak do aktivacije vašeg Glatko naloga.",
      heading: "Dobrodošli na Glatko",
      intro:
        "Pozdrav {firstName}, hvala što ste se registrovali. Da biste aktivirali nalog, potvrdite email klikom na dugme.",
      cta: "Potvrdi email",
      expiry: "Ovaj link važi narednih 24 sata.",
      ignoreNote: "Ako se niste registrovali, zanemarite ovaj email.",
      signature: "Glatko tim",
    },
    magiclink: {
      subject: "Glatko: Vaš link za prijavu",
      preheader: "Bezbedna prijava bez lozinke.",
      heading: "Prijavite se na Glatko",
      intro:
        "Pozdrav {firstName}, kliknite ispod da se prijavite bez unosa lozinke.",
      cta: "Prijavite se",
      expiry: "Ovaj link važi narednih 60 minuta.",
      ignoreNote: "Ako niste tražili prijavu, zanemarite ovaj email.",
      signature: "Glatko tim",
    },
    email_change: {
      subject: "Glatko: Potvrdite promenu email adrese",
      preheader: "Potvrdite vašu novu email adresu.",
      heading: "Potvrdite novu email adresu",
      intro:
        "Pozdrav {firstName}, primili smo zahtev za promenu email adrese. Kliknite ispod da potvrdite novu.",
      cta: "Potvrdi novu adresu",
      expiry: "Ovaj link važi narednih 24 sata.",
      ignoreNote: "Ako niste tražili promenu, kontaktirajte podršku odmah.",
      signature: "Glatko tim",
    },
    reauthentication: {
      subject: "Glatko: Potvrdite identitet",
      preheader: "Bezbednosna potvrda za nastavak.",
      heading: "Potvrdite identitet",
      intro:
        "Pozdrav {firstName}, za ovu osetljivu radnju unesite kod ispod u Glatko aplikaciji: {code}",
      cta: "Otvori Glatko",
      expiry: "Ovaj kod važi narednih 10 minuta.",
      ignoreNote:
        "Ako niste vi, neko pokušava pristup — odmah promenite lozinku.",
      signature: "Glatko tim",
    },
    common: { codeLabel: "Vaš kod za potvrdu" },
  },

  en: {
    recovery: {
      subject: "Glatko: Reset your password",
      preheader: "Click the link below to reset your Glatko password.",
      heading: "Reset your password",
      intro:
        "Hi {firstName}, we received a request to reset the password for your Glatko account. Click the button below to set a new password.",
      cta: "Reset password",
      expiry: "This link is valid for the next 60 minutes.",
      ignoreNote:
        "If you didn't request a password reset, you can safely ignore this email — your password remains unchanged.",
      signature: "The Glatko team",
    },
    signup: {
      subject: "Glatko: Confirm your email",
      preheader: "One step away from activating your Glatko account.",
      heading: "Welcome to Glatko",
      intro:
        "Hi {firstName}, thanks for signing up to Glatko. To activate your account, confirm your email by clicking the button below.",
      cta: "Confirm email",
      expiry: "This link is valid for the next 24 hours.",
      ignoreNote:
        "If you didn't sign up to Glatko, you can safely ignore this email.",
      signature: "The Glatko team",
    },
    magiclink: {
      subject: "Glatko: Your sign-in link",
      preheader: "Click to sign in securely without a password.",
      heading: "Sign in to Glatko",
      intro:
        "Hi {firstName}, click the button below to sign in to Glatko without entering your password.",
      cta: "Sign in",
      expiry: "This link is valid for the next 60 minutes.",
      ignoreNote:
        "If you didn't request to sign in, you can safely ignore this email.",
      signature: "The Glatko team",
    },
    email_change: {
      subject: "Glatko: Confirm new email address",
      preheader: "Confirm your new email for your Glatko account.",
      heading: "Confirm new email address",
      intro:
        "Hi {firstName}, we received a request to change the email address on your Glatko account. Click below to confirm your new address.",
      cta: "Confirm new address",
      expiry: "This link is valid for the next 24 hours.",
      ignoreNote:
        "If you didn't request an email change, contact support immediately.",
      signature: "The Glatko team",
    },
    reauthentication: {
      subject: "Glatko: Confirm your identity",
      preheader: "Security verification to continue.",
      heading: "Confirm identity",
      intro:
        "Hi {firstName}, to perform this sensitive action enter the code below in the Glatko app: {code}",
      cta: "Open Glatko",
      expiry: "This code is valid for the next 10 minutes.",
      ignoreNote:
        "If this wasn't you, someone might be trying to access your account — change your password immediately.",
      signature: "The Glatko team",
    },
    common: { codeLabel: "Your verification code" },
  },

  tr: {
    recovery: {
      subject: "Glatko: Şifrenizi sıfırlayın",
      preheader: "Glatko şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın.",
      heading: "Şifrenizi sıfırlayın",
      intro:
        "Merhaba {firstName}, Glatko hesabınız için şifre sıfırlama talebi aldık. Yeni bir şifre belirlemek için aşağıdaki düğmeye tıklayın.",
      cta: "Şifreyi sıfırla",
      expiry: "Bu bağlantı 60 dakika boyunca geçerlidir.",
      ignoreNote:
        "Şifre sıfırlamayı siz talep etmediyseniz, bu e-postayı güvenle yok sayabilirsiniz — şifreniz değişmeden kalır.",
      signature: "Glatko ekibi",
    },
    signup: {
      subject: "Glatko: Email adresinizi doğrulayın",
      preheader: "Glatko hesabınızı aktifleştirmek için bir adım kaldı.",
      heading: "Glatko'ya hoş geldiniz",
      intro:
        "Merhaba {firstName}, Glatko'ya kaydolduğunuz için teşekkürler. Hesabınızı aktifleştirmek için aşağıdaki düğmeye tıklayarak e-posta adresinizi doğrulayın.",
      cta: "E-postayı doğrula",
      expiry: "Bu bağlantı 24 saat boyunca geçerlidir.",
      ignoreNote:
        "Glatko'ya kaydolmadıysanız, bu e-postayı güvenle yok sayabilirsiniz.",
      signature: "Glatko ekibi",
    },
    magiclink: {
      subject: "Glatko: Giriş bağlantınız",
      preheader: "Şifresiz güvenli giriş için tıklayın.",
      heading: "Glatko'ya giriş yap",
      intro:
        "Merhaba {firstName}, şifre girmeden Glatko'ya giriş yapmak için aşağıdaki düğmeye tıklayın.",
      cta: "Giriş yap",
      expiry: "Bu bağlantı 60 dakika boyunca geçerlidir.",
      ignoreNote:
        "Giriş talep etmediyseniz, bu e-postayı güvenle yok sayabilirsiniz.",
      signature: "Glatko ekibi",
    },
    email_change: {
      subject: "Glatko: Yeni email adresinizi doğrulayın",
      preheader: "Glatko hesabınız için yeni e-posta adresinizi doğrulayın.",
      heading: "Yeni e-posta adresini doğrula",
      intro:
        "Merhaba {firstName}, Glatko hesabınızın e-posta adresini değiştirme talebi aldık. Yeni adresi doğrulamak için aşağıya tıklayın.",
      cta: "Yeni adresi doğrula",
      expiry: "Bu bağlantı 24 saat boyunca geçerlidir.",
      ignoreNote:
        "E-posta değişikliği talep etmediyseniz, lütfen hemen destekle iletişime geçin.",
      signature: "Glatko ekibi",
    },
    reauthentication: {
      subject: "Glatko: Kimliğinizi doğrulayın",
      preheader: "Devam etmek için güvenlik doğrulaması.",
      heading: "Kimliğinizi doğrulayın",
      intro:
        "Merhaba {firstName}, bu hassas işlemi gerçekleştirmek için aşağıdaki kodu Glatko uygulamasına girin: {code}",
      cta: "Glatko'yu aç",
      expiry: "Bu kod 10 dakika boyunca geçerlidir.",
      ignoreNote:
        "Bunu siz yapmadıysanız, biri hesabınıza erişmeye çalışıyor olabilir — hemen şifrenizi değiştirin.",
      signature: "Glatko ekibi",
    },
    common: { codeLabel: "Doğrulama kodunuz" },
  },

  de: {
    recovery: {
      subject: "Glatko: Passwort zurücksetzen",
      preheader: "Klicken Sie auf den Link, um Ihr Glatko-Passwort zurückzusetzen.",
      heading: "Passwort zurücksetzen",
      intro:
        "Hallo {firstName}, wir haben eine Anfrage erhalten, das Passwort für Ihr Glatko-Konto zurückzusetzen. Klicken Sie auf die Schaltfläche unten, um ein neues Passwort festzulegen.",
      cta: "Passwort zurücksetzen",
      expiry: "Dieser Link ist die nächsten 60 Minuten gültig.",
      ignoreNote:
        "Falls Sie kein Passwort-Reset angefordert haben, können Sie diese E-Mail ignorieren — Ihr Passwort bleibt unverändert.",
      signature: "Ihr Glatko-Team",
    },
    signup: {
      subject: "Glatko: E-Mail bestätigen",
      preheader: "Ein Schritt fehlt zur Aktivierung Ihres Glatko-Kontos.",
      heading: "Willkommen bei Glatko",
      intro:
        "Hallo {firstName}, danke für Ihre Registrierung bei Glatko. Aktivieren Sie Ihr Konto, indem Sie Ihre E-Mail-Adresse über die Schaltfläche unten bestätigen.",
      cta: "E-Mail bestätigen",
      expiry: "Dieser Link ist die nächsten 24 Stunden gültig.",
      ignoreNote:
        "Falls Sie sich nicht bei Glatko registriert haben, können Sie diese E-Mail ignorieren.",
      signature: "Ihr Glatko-Team",
    },
    magiclink: {
      subject: "Glatko: Ihr Anmeldelink",
      preheader: "Klicken Sie für eine sichere Anmeldung ohne Passwort.",
      heading: "Bei Glatko anmelden",
      intro:
        "Hallo {firstName}, klicken Sie auf die Schaltfläche unten, um sich bei Glatko anzumelden, ohne ein Passwort einzugeben.",
      cta: "Anmelden",
      expiry: "Dieser Link ist die nächsten 60 Minuten gültig.",
      ignoreNote:
        "Falls Sie keine Anmeldung angefordert haben, können Sie diese E-Mail ignorieren.",
      signature: "Ihr Glatko-Team",
    },
    email_change: {
      subject: "Glatko: Neue E-Mail-Adresse bestätigen",
      preheader: "Bestätigen Sie Ihre neue E-Mail-Adresse für Ihr Glatko-Konto.",
      heading: "Neue E-Mail-Adresse bestätigen",
      intro:
        "Hallo {firstName}, wir haben eine Anfrage erhalten, die E-Mail-Adresse Ihres Glatko-Kontos zu ändern. Klicken Sie unten, um die neue Adresse zu bestätigen.",
      cta: "Neue Adresse bestätigen",
      expiry: "Dieser Link ist die nächsten 24 Stunden gültig.",
      ignoreNote:
        "Falls Sie keine E-Mail-Änderung angefordert haben, kontaktieren Sie sofort den Support.",
      signature: "Ihr Glatko-Team",
    },
    reauthentication: {
      subject: "Glatko: Identität bestätigen",
      preheader: "Sicherheitsprüfung zum Fortfahren.",
      heading: "Identität bestätigen",
      intro:
        "Hallo {firstName}, geben Sie zur Durchführung dieser sensiblen Aktion den folgenden Code in der Glatko-App ein: {code}",
      cta: "Glatko öffnen",
      expiry: "Dieser Code ist die nächsten 10 Minuten gültig.",
      ignoreNote:
        "Falls Sie das nicht waren, versucht möglicherweise jemand auf Ihr Konto zuzugreifen — ändern Sie sofort Ihr Passwort.",
      signature: "Ihr Glatko-Team",
    },
    common: { codeLabel: "Ihr Bestätigungscode" },
  },

  it: {
    recovery: {
      subject: "Glatko: Reimposta la password",
      preheader: "Clicca il link qui sotto per reimpostare la password Glatko.",
      heading: "Reimposta la tua password",
      intro:
        "Ciao {firstName}, abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account Glatko. Clicca il pulsante sotto per impostare una nuova password.",
      cta: "Reimposta password",
      expiry: "Questo link è valido per i prossimi 60 minuti.",
      ignoreNote:
        "Se non hai richiesto una reimpostazione, ignora pure questa email — la tua password resta invariata.",
      signature: "Il team Glatko",
    },
    signup: {
      subject: "Glatko: Conferma la tua email",
      preheader: "Un passo per attivare il tuo account Glatko.",
      heading: "Benvenuto su Glatko",
      intro:
        "Ciao {firstName}, grazie per esserti registrato a Glatko. Per attivare il tuo account, conferma la tua email cliccando il pulsante sotto.",
      cta: "Conferma email",
      expiry: "Questo link è valido per le prossime 24 ore.",
      ignoreNote: "Se non ti sei registrato a Glatko, ignora pure questa email.",
      signature: "Il team Glatko",
    },
    magiclink: {
      subject: "Glatko: Il tuo link di accesso",
      preheader: "Clicca per accedere in modo sicuro senza password.",
      heading: "Accedi a Glatko",
      intro:
        "Ciao {firstName}, clicca il pulsante sotto per accedere a Glatko senza inserire la password.",
      cta: "Accedi",
      expiry: "Questo link è valido per i prossimi 60 minuti.",
      ignoreNote:
        "Se non hai richiesto l'accesso, ignora pure questa email.",
      signature: "Il team Glatko",
    },
    email_change: {
      subject: "Glatko: Conferma il nuovo indirizzo email",
      preheader: "Conferma il tuo nuovo indirizzo per l'account Glatko.",
      heading: "Conferma nuovo indirizzo email",
      intro:
        "Ciao {firstName}, abbiamo ricevuto una richiesta di modifica dell'indirizzo email del tuo account Glatko. Clicca sotto per confermare il nuovo indirizzo.",
      cta: "Conferma nuovo indirizzo",
      expiry: "Questo link è valido per le prossime 24 ore.",
      ignoreNote:
        "Se non hai richiesto la modifica dell'email, contatta subito l'assistenza.",
      signature: "Il team Glatko",
    },
    reauthentication: {
      subject: "Glatko: Conferma la tua identità",
      preheader: "Verifica di sicurezza per continuare.",
      heading: "Conferma identità",
      intro:
        "Ciao {firstName}, per eseguire questa azione sensibile inserisci il seguente codice nell'app Glatko: {code}",
      cta: "Apri Glatko",
      expiry: "Questo codice è valido per i prossimi 10 minuti.",
      ignoreNote:
        "Se non sei stato tu, qualcuno potrebbe tentare di accedere al tuo account — cambia subito la password.",
      signature: "Il team Glatko",
    },
    common: { codeLabel: "Il tuo codice di verifica" },
  },

  ru: {
    recovery: {
      subject: "Glatko: Сбросьте пароль",
      preheader: "Нажмите на ссылку ниже, чтобы сбросить пароль Glatko.",
      heading: "Сброс пароля",
      intro:
        "Здравствуйте, {firstName}. Мы получили запрос на сброс пароля вашего аккаунта Glatko. Нажмите на кнопку ниже, чтобы установить новый пароль.",
      cta: "Сбросить пароль",
      expiry: "Эта ссылка действительна следующие 60 минут.",
      ignoreNote:
        "Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо — ваш пароль не изменится.",
      signature: "Команда Glatko",
    },
    signup: {
      subject: "Glatko: Подтвердите email",
      preheader: "Один шаг до активации вашего аккаунта Glatko.",
      heading: "Добро пожаловать в Glatko",
      intro:
        "Здравствуйте, {firstName}. Спасибо за регистрацию в Glatko. Чтобы активировать аккаунт, подтвердите email, нажав на кнопку ниже.",
      cta: "Подтвердить email",
      expiry: "Эта ссылка действительна следующие 24 часа.",
      ignoreNote:
        "Если вы не регистрировались в Glatko, просто проигнорируйте это письмо.",
      signature: "Команда Glatko",
    },
    magiclink: {
      subject: "Glatko: Ваша ссылка для входа",
      preheader: "Нажмите для безопасного входа без пароля.",
      heading: "Войти в Glatko",
      intro:
        "Здравствуйте, {firstName}. Нажмите на кнопку ниже, чтобы войти в Glatko без ввода пароля.",
      cta: "Войти",
      expiry: "Эта ссылка действительна следующие 60 минут.",
      ignoreNote:
        "Если вы не запрашивали вход, просто проигнорируйте это письмо.",
      signature: "Команда Glatko",
    },
    email_change: {
      subject: "Glatko: Подтвердите новый email",
      preheader: "Подтвердите новый email вашего аккаунта Glatko.",
      heading: "Подтвердите новый email",
      intro:
        "Здравствуйте, {firstName}. Мы получили запрос на изменение email адреса вашего аккаунта Glatko. Нажмите ниже, чтобы подтвердить новый адрес.",
      cta: "Подтвердить новый адрес",
      expiry: "Эта ссылка действительна следующие 24 часа.",
      ignoreNote:
        "Если вы не запрашивали смену email, немедленно свяжитесь со службой поддержки.",
      signature: "Команда Glatko",
    },
    reauthentication: {
      subject: "Glatko: Подтвердите личность",
      preheader: "Проверка безопасности для продолжения.",
      heading: "Подтвердите личность",
      intro:
        "Здравствуйте, {firstName}. Чтобы выполнить это действие, введите следующий код в приложении Glatko: {code}",
      cta: "Открыть Glatko",
      expiry: "Этот код действителен следующие 10 минут.",
      ignoreNote:
        "Если это были не вы, кто-то может пытаться получить доступ к вашему аккаунту — немедленно смените пароль.",
      signature: "Команда Glatko",
    },
    common: { codeLabel: "Ваш код подтверждения" },
  },

  ar: {
    recovery: {
      subject: "Glatko: إعادة تعيين كلمة المرور",
      preheader: "اضغط على الرابط أدناه لإعادة تعيين كلمة مرور Glatko الخاصة بك.",
      heading: "إعادة تعيين كلمة المرور",
      intro:
        "مرحباً {firstName}، تلقّينا طلباً لإعادة تعيين كلمة المرور لحسابك على Glatko. اضغط على الزر أدناه لتعيين كلمة مرور جديدة.",
      cta: "إعادة تعيين كلمة المرور",
      expiry: "هذا الرابط صالح للستين دقيقة القادمة.",
      ignoreNote:
        "إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان — كلمة مرورك لن تتغيّر.",
      signature: "فريق Glatko",
    },
    signup: {
      subject: "Glatko: تأكيد بريدك الإلكتروني",
      preheader: "خطوة واحدة لتفعيل حسابك في Glatko.",
      heading: "أهلاً بك في Glatko",
      intro:
        "مرحباً {firstName}، شكراً لتسجيلك في Glatko. لتفعيل حسابك، أكّد بريدك الإلكتروني بالضغط على الزر أدناه.",
      cta: "تأكيد البريد الإلكتروني",
      expiry: "هذا الرابط صالح لأربع وعشرين ساعة قادمة.",
      ignoreNote:
        "إذا لم تسجّل في Glatko، يمكنك تجاهل هذه الرسالة بأمان.",
      signature: "فريق Glatko",
    },
    magiclink: {
      subject: "Glatko: رابط تسجيل الدخول",
      preheader: "اضغط لتسجيل الدخول بأمان بدون كلمة مرور.",
      heading: "تسجيل الدخول إلى Glatko",
      intro:
        "مرحباً {firstName}، اضغط على الزر أدناه لتسجيل الدخول إلى Glatko دون إدخال كلمة مرور.",
      cta: "تسجيل الدخول",
      expiry: "هذا الرابط صالح للستين دقيقة القادمة.",
      ignoreNote:
        "إذا لم تطلب تسجيل الدخول، يمكنك تجاهل هذه الرسالة بأمان.",
      signature: "فريق Glatko",
    },
    email_change: {
      subject: "Glatko: تأكيد البريد الإلكتروني الجديد",
      preheader: "أكّد عنوان بريدك الإلكتروني الجديد لحساب Glatko.",
      heading: "تأكيد عنوان البريد الإلكتروني الجديد",
      intro:
        "مرحباً {firstName}، تلقّينا طلباً لتغيير عنوان البريد الإلكتروني لحسابك على Glatko. اضغط أدناه لتأكيد العنوان الجديد.",
      cta: "تأكيد العنوان الجديد",
      expiry: "هذا الرابط صالح لأربع وعشرين ساعة قادمة.",
      ignoreNote:
        "إذا لم تطلب تغيير البريد الإلكتروني، تواصل مع الدعم فوراً.",
      signature: "فريق Glatko",
    },
    reauthentication: {
      subject: "Glatko: تأكيد هويتك",
      preheader: "تحقّق أمني للمتابعة.",
      heading: "تأكيد الهوية",
      intro:
        "مرحباً {firstName}، لإتمام هذا الإجراء الحسّاس أدخل الرمز التالي في تطبيق Glatko: {code}",
      cta: "فتح Glatko",
      expiry: "هذا الرمز صالح للعشر دقائق القادمة.",
      ignoreNote:
        "إذا لم تكن أنت، فقد يحاول شخص ما الوصول إلى حسابك — غيّر كلمة المرور فوراً.",
      signature: "فريق Glatko",
    },
    common: { codeLabel: "رمز التحقّق الخاص بك" },
  },

  uk: {
    recovery: {
      subject: "Glatko: Скиньте пароль",
      preheader: "Натисніть посилання нижче, щоб скинути пароль Glatko.",
      heading: "Скидання пароля",
      intro:
        "Вітаємо, {firstName}. Ми отримали запит на скидання пароля для вашого облікового запису Glatko. Натисніть кнопку нижче, щоб встановити новий пароль.",
      cta: "Скинути пароль",
      expiry: "Це посилання дійсне наступні 60 хвилин.",
      ignoreNote:
        "Якщо ви не запитували скидання пароля, просто проігноруйте цей лист — ваш пароль залишиться без змін.",
      signature: "Команда Glatko",
    },
    signup: {
      subject: "Glatko: Підтвердіть email",
      preheader: "Один крок до активації вашого облікового запису Glatko.",
      heading: "Ласкаво просимо до Glatko",
      intro:
        "Вітаємо, {firstName}. Дякуємо за реєстрацію в Glatko. Щоб активувати обліковий запис, підтвердіть email, натиснувши кнопку нижче.",
      cta: "Підтвердити email",
      expiry: "Це посилання дійсне наступні 24 години.",
      ignoreNote:
        "Якщо ви не реєструвалися в Glatko, просто проігноруйте цей лист.",
      signature: "Команда Glatko",
    },
    magiclink: {
      subject: "Glatko: Ваше посилання для входу",
      preheader: "Натисніть для безпечного входу без пароля.",
      heading: "Вхід у Glatko",
      intro:
        "Вітаємо, {firstName}. Натисніть кнопку нижче, щоб увійти в Glatko без введення пароля.",
      cta: "Увійти",
      expiry: "Це посилання дійсне наступні 60 хвилин.",
      ignoreNote:
        "Якщо ви не запитували вхід, просто проігноруйте цей лист.",
      signature: "Команда Glatko",
    },
    email_change: {
      subject: "Glatko: Підтвердіть нову email-адресу",
      preheader: "Підтвердіть нову email-адресу для облікового запису Glatko.",
      heading: "Підтвердіть нову email адресу",
      intro:
        "Вітаємо, {firstName}. Ми отримали запит на зміну email адреси вашого облікового запису Glatko. Натисніть нижче, щоб підтвердити нову адресу.",
      cta: "Підтвердити нову адресу",
      expiry: "Це посилання дійсне наступні 24 години.",
      ignoreNote:
        "Якщо ви не запитували зміну email, негайно зв'яжіться зі службою підтримки.",
      signature: "Команда Glatko",
    },
    reauthentication: {
      subject: "Glatko: Підтвердіть особу",
      preheader: "Перевірка безпеки для продовження.",
      heading: "Підтвердіть особу",
      intro:
        "Вітаємо, {firstName}. Щоб виконати цю чутливу дію, введіть цей код у застосунку Glatko: {code}",
      cta: "Відкрити Glatko",
      expiry: "Цей код дійсний наступні 10 хвилин.",
      ignoreNote:
        "Якщо це не ви, хтось може намагатися отримати доступ до вашого облікового запису — негайно змініть пароль.",
      signature: "Команда Glatko",
    },
    common: { codeLabel: "Ваш код підтвердження" },
  },
};

export function getAuthEmailCopy(
  locale: EmailLocale,
  type: AuthEmailType,
): AuthEmailCopy {
  return authTranslations[locale][type];
}

export function getAuthEmailCommon(locale: EmailLocale): AuthCommonCopy {
  return authTranslations[locale].common;
}
