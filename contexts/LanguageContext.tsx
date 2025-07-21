"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Locale, defaultLocale } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.tours": "Tours",
    "nav.about": "About",
    "nav.cart": "Cart",
    "nav.signin": "Sign In",
    "nav.signup": "Sign Up",
    "nav.signout": "Sign Out",
    "nav.admin": "Admin Dashboard",

    // Home page
    "home.hero.title1": "Discover Amazing Destinations",
    "home.hero.desc1":
      "Experience the world like never before with our curated travel packages",
    "home.hero.title2": "Adventure Awaits",
    "home.hero.desc2":
      "From mountain peaks to pristine beaches, your next adventure starts here",
    "home.hero.title3": "Cultural Immersion",
    "home.hero.desc3":
      "Immerse yourself in local cultures and create memories that last a lifetime",
    "home.hero.explore": "Explore Tours",
    "home.featured.title": "Featured Tours",
    "home.featured.subtitle": "Discover our most popular destinations",
    "home.company.title": "Why Choose Wanderlust Adventures?",
    "home.company.desc":
      "With over 15 years of experience in creating unforgettable travel experiences, we specialize in crafting personalized tours that connect you with the heart and soul of each destination.",
    "home.cta.title": "Ready for Your Next Adventure?",
    "home.cta.subtitle":
      "Join thousands of satisfied travelers who have discovered the world with us",
    "home.cta.browse": "Browse All Tours",
    "home.cta.learn": "Learn More About Us",

    // Tours page
    "tours.title": "Discover Our Tours",
    "tours.subtitle": "Find your perfect adventure from our curated collection",
    "tours.search": "Search tours, destinations...",
    "tours.category.all": "All Categories",
    "tours.category.adventure": "Adventure",
    "tours.category.cultural": "Cultural",
    "tours.category.beach": "Beach & Island",
    "tours.category.mountain": "Mountain",
    "tours.category.city": "City Tours",
    "tours.filters": "More Filters",
    "tours.showing": "Showing",
    "tours.tour": "tour",
    "tours.tours": "tours",
    "tours.viewDetails": "View Details",
    "tours.addToCart": "Add to Cart",
    "tours.noResults": "No tours found matching your criteria.",
    "tours.clearFilters": "Clear Filters",

    // Cart page
    "cart.title": "Shopping Cart",
    "cart.empty.title": "Your cart is empty",
    "cart.empty.subtitle": "Discover amazing tours and add them to your cart",
    "cart.empty.browse": "Browse Tours",
    "cart.summary": "Order Summary",
    "cart.subtotal": "Subtotal",
    "cart.serviceFee": "Service Fee",
    "cart.taxes": "Taxes",
    "cart.total": "Total",
    "cart.checkout": "Proceed to Checkout",
    "cart.signin.required": "Please sign in to proceed with checkout",
    "cart.continue": "Continue Shopping",
    "cart.processing": "Processing...",

    // Auth pages
    "auth.signin.title": "Welcome Back",
    "auth.signin.subtitle": "Sign in to your account",
    "auth.signin.email": "Email",
    "auth.signin.password": "Password",
    "auth.signin.button": "Sign In",
    "auth.signin.noAccount": "Don't have an account?",
    "auth.signin.demo": "Demo Accounts:",
    "auth.signup.title": "Create Account",
    "auth.signup.subtitle": "Join Wanderlust Adventures",
    "auth.signup.name": "Full Name",
    "auth.signup.confirmPassword": "Confirm Password",
    "auth.signup.button": "Create Account",
    "auth.signup.hasAccount": "Already have an account?",

    // Common
    "common.loading": "Loading...",
    "common.perPerson": "per person",
    "common.days": "Days",
    "common.rating": "Rating",
    "common.features": "Features",
    "common.location": "Location",
    "common.duration": "Duration",
    "common.price": "Price",

    "auth.signup.fullNamePlaceholder": "Enter your full name",
    "auth.signup.emailPlaceholder": "Enter your email",
    "auth.signup.passwordPlaceholder": "Create a strong password",
    "auth.signup.confirmPasswordPlaceholder": "Confirm your password",
    "auth.signup.passwordRequirements":
      "Must be 8+ characters with uppercase, lowercase, and numbers",
    "auth.signup.accountType": "Account Type",
    "auth.signup.user": "User",
    "auth.signup.admin": "Admin",
    "auth.signup.creating": "Creating account...",

    "auth.signin.emailPlaceholder": "Enter your email",
    "auth.signin.passwordPlaceholder": "Enter your password",
    "auth.signin.signingIn": "Signing in...",
    "auth.signin.demoAccount": "Demo Account",
    "auth.signin.demoDesc1":
      "Create a new account to test the authentication flow",
    "auth.signin.demoDesc2": "Verification codes will be sent to your email",

    // Toast messages
    "toast.passwordMismatch": "Passwords do not match",
    "toast.passwordTooShort": "Password must be at least 8 characters",
    "toast.passwordWeak":
      "Password must contain uppercase, lowercase, and numbers",
    "toast.accountCreated":
      "Account created! Please check your email for verification code.",
    "toast.accountSuccess": "Account created successfully!",
    "toast.signInSuccess": "Signed in successfully!",
    "toast.verifyEmail": "Please verify your email first",
    "toast.invalidCredentials": "Invalid email or password",
    "toast.userNotFound": "No account found with this email",
    "toast.createAccountFailed": "Failed to create account",
    "toast.signInFailed": "Failed to sign in",
  },
  zh: {
    // Navigation
    "nav.home": "首页",
    "nav.tours": "旅游",
    "nav.about": "关于我们",
    "nav.cart": "购物车",
    "nav.signin": "登录",
    "nav.signup": "注册",
    "nav.signout": "退出",
    "nav.admin": "管理面板",

    // Home page
    "home.hero.title1": "发现令人惊叹的目的地",
    "home.hero.desc1": "通过我们精心策划的旅行套餐，以前所未有的方式体验世界",
    "home.hero.title2": "冒险等待着您",
    "home.hero.desc2": "从山峰到原始海滩，您的下一次冒险从这里开始",
    "home.hero.title3": "文化沉浸",
    "home.hero.desc3": "沉浸在当地文化中，创造终生难忘的回忆",
    "home.hero.explore": "探索旅游",
    "home.featured.title": "精选旅游",
    "home.featured.subtitle": "发现我们最受欢迎的目的地",
    "home.company.title": "为什么选择漫游冒险？",
    "home.company.desc":
      "凭借超过15年创造难忘旅行体验的经验，我们专门制作个性化旅游，将您与每个目的地的核心和灵魂联系起来。",
    "home.cta.title": "准备好您的下一次冒险了吗？",
    "home.cta.subtitle": "加入成千上万与我们一起发现世界的满意旅行者",
    "home.cta.browse": "浏览所有旅游",
    "home.cta.learn": "了解更多关于我们",

    // Tours page
    "tours.title": "发现我们的旅游",
    "tours.subtitle": "从我们精心策划的收藏中找到您的完美冒险",
    "tours.search": "搜索旅游、目的地...",
    "tours.category.all": "所有类别",
    "tours.category.adventure": "冒险",
    "tours.category.cultural": "文化",
    "tours.category.beach": "海滩和岛屿",
    "tours.category.mountain": "山地",
    "tours.category.city": "城市旅游",
    "tours.filters": "更多筛选",
    "tours.showing": "显示",
    "tours.tour": "旅游",
    "tours.tours": "旅游",
    "tours.viewDetails": "查看详情",
    "tours.addToCart": "添加到购物车",
    "tours.noResults": "没有找到符合您条件的旅游。",
    "tours.clearFilters": "清除筛选",

    // Cart page
    "cart.title": "购物车",
    "cart.empty.title": "您的购物车是空的",
    "cart.empty.subtitle": "发现令人惊叹的旅游并将它们添加到您的购物车",
    "cart.empty.browse": "浏览旅游",
    "cart.summary": "订单摘要",
    "cart.subtotal": "小计",
    "cart.serviceFee": "服务费",
    "cart.taxes": "税费",
    "cart.total": "总计",
    "cart.checkout": "继续结账",
    "cart.signin.required": "请登录以继续结账",
    "cart.continue": "继续购物",
    "cart.processing": "处理中...",

    //auth

    "auth.signup.fullNamePlaceholder": "输入您的全名",
    "auth.signup.emailPlaceholder": "输入您的邮箱",
    "auth.signup.passwordPlaceholder": "创建强密码",
    "auth.signup.confirmPasswordPlaceholder": "确认您的密码",
    "auth.signup.passwordRequirements":
      "必须是8个以上字符，包含大写、小写和数字",
    "auth.signup.accountType": "账户类型",
    "auth.signup.user": "用户",
    "auth.signup.admin": "管理员",
    "auth.signup.creating": "创建账户中...",

    "auth.signin.emailPlaceholder": "输入您的邮箱",
    "auth.signin.passwordPlaceholder": "输入您的密码",
    "auth.signin.signingIn": "登录中...",
    "auth.signin.demoAccount": "演示账户",
    "auth.signin.demoDesc1": "创建新账户以测试认证流程",
    "auth.signin.demoDesc2": "验证码将发送到您的邮箱",

    // Toast messages
    "toast.passwordMismatch": "密码不匹配",
    "toast.passwordTooShort": "密码必须至少8个字符",
    "toast.passwordWeak": "密码必须包含大写、小写和数字",
    "toast.accountCreated": "账户创建成功！请检查您的邮箱获取验证码。",
    "toast.accountSuccess": "账户创建成功！",
    "toast.signInSuccess": "登录成功！",
    "toast.verifyEmail": "请先验证您的邮箱",
    "toast.invalidCredentials": "邮箱或密码无效",
    "toast.userNotFound": "未找到此邮箱的账户",
    "toast.createAccountFailed": "创建账户失败",
    "toast.signInFailed": "登录失败",

     "auth.signin.title": "欢迎回来",
  "auth.signin.subtitle": "登录您的账户", 
  "auth.signin.email": "邮箱",
  "auth.signin.password": "密码",
  "auth.signin.button": "登录",
  "auth.signin.noAccount": "没有账户？",
  "auth.signin.demo": "演示账户：",
  "auth.signup.title": "创建账户",
  "auth.signup.subtitle": "加入漫游冒险",
  "auth.signup.name": "全名",
  "auth.signup.confirmPassword": "确认密码",
  "auth.signup.button": "创建账户",
  "auth.signup.hasAccount": "已有账户？",

  // Common - MISSING FROM YOUR CURRENT zh TRANSLATIONS
  "common.loading": "加载中...",
  "common.perPerson": "每人",
  "common.days": "天",
  "common.rating": "评分",
  "common.features": "特色",
  "common.location": "位置",
  "common.duration": "持续时间",
  "common.price": "价格",
  },
  ja: {
    // Navigation
    "nav.home": "ホーム",
    "nav.tours": "ツアー",
    "nav.about": "私たちについて",
    "nav.cart": "カート",
    "nav.signin": "サインイン",
    "nav.signup": "サインアップ",
    "nav.signout": "サインアウト",
    "nav.admin": "管理ダッシュボード",

    // Home page
    "home.hero.title1": "素晴らしい目的地を発見",
    "home.hero.desc1":
      "厳選された旅行パッケージで、これまでにない世界を体験してください",
    "home.hero.title2": "冒険があなたを待っています",
    "home.hero.desc2":
      "山頂から手つかずのビーチまで、あなたの次の冒険がここから始まります",
    "home.hero.title3": "文化的没入",
    "home.hero.desc3": "地元の文化に浸り、一生の思い出を作りましょう",
    "home.hero.explore": "ツアーを探索",
    "home.featured.title": "注目のツアー",
    "home.featured.subtitle": "最も人気のある目的地を発見",
    "home.company.title": "なぜワンダーラスト・アドベンチャーズを選ぶのか？",
    "home.company.desc":
      "15年以上の忘れられない旅行体験の創造経験を持つ私たちは、あなたを各目的地の心と魂に結びつけるパーソナライズされたツアーの作成を専門としています。",
    "home.cta.title": "次の冒険の準備はできていますか？",
    "home.cta.subtitle":
      "私たちと一緒に世界を発見した何千人もの満足した旅行者に参加してください",
    "home.cta.browse": "すべてのツアーを閲覧",
    "home.cta.learn": "私たちについてもっと学ぶ",

    // Tours page
    "tours.title": "私たちのツアーを発見",
    "tours.subtitle": "厳選されたコレクションから完璧な冒険を見つけてください",
    "tours.search": "ツアー、目的地を検索...",
    "tours.category.all": "すべてのカテゴリー",
    "tours.category.adventure": "アドベンチャー",
    "tours.category.cultural": "文化",
    "tours.category.beach": "ビーチ＆アイランド",
    "tours.category.mountain": "山",
    "tours.category.city": "シティツアー",
    "tours.filters": "その他のフィルター",
    "tours.showing": "表示中",
    "tours.tour": "ツアー",
    "tours.tours": "ツアー",
    "tours.viewDetails": "詳細を見る",
    "tours.addToCart": "カートに追加",
    "tours.noResults": "条件に一致するツアーが見つかりません。",
    "tours.clearFilters": "フィルターをクリア",

    // Cart page
    "cart.title": "ショッピングカート",
    "cart.empty.title": "カートは空です",
    "cart.empty.subtitle": "素晴らしいツアーを発見してカートに追加してください",
    "cart.empty.browse": "ツアーを閲覧",
    "cart.summary": "注文概要",
    "cart.subtotal": "小計",
    "cart.serviceFee": "サービス料",
    "cart.taxes": "税金",
    "cart.total": "合計",
    "cart.checkout": "チェックアウトに進む",
    "cart.signin.required":
      "チェックアウトを続行するにはサインインしてください",
    "cart.continue": "ショッピングを続ける",
    "cart.processing": "処理中...",

    // Japanese translations
    'auth.signup.fullNamePlaceholder': 'フルネームを入力',
    'auth.signup.emailPlaceholder': 'メールアドレスを入力',
    'auth.signup.passwordPlaceholder': '強力なパスワードを作成',
    'auth.signup.confirmPasswordPlaceholder': 'パスワードを確認',
    'auth.signup.passwordRequirements': '8文字以上で大文字、小文字、数字を含む必要があります',
    'auth.signup.accountType': 'アカウントタイプ',
    'auth.signup.user': 'ユーザー',
    'auth.signup.admin': '管理者',
    'auth.signup.creating': 'アカウント作成中...',
    
    'auth.signin.emailPlaceholder': 'メールアドレスを入力',
    'auth.signin.passwordPlaceholder': 'パスワードを入力',
    'auth.signin.signingIn': 'サインイン中...',
    'auth.signin.demoAccount': 'デモアカウント',
    'auth.signin.demoDesc1': '認証フローをテストするために新しいアカウントを作成',
    'auth.signin.demoDesc2': '確認コードがメールに送信されます',
    
    // Toast messages
    'toast.passwordMismatch': 'パスワードが一致しません',
    'toast.passwordTooShort': 'パスワードは8文字以上である必要があります',
    'toast.passwordWeak': 'パスワードは大文字、小文字、数字を含む必要があります',
    'toast.accountCreated': 'アカウントが作成されました！確認コードのメールをチェックしてください。',
    'toast.accountSuccess': 'アカウントが正常に作成されました！',
    'toast.signInSuccess': 'サインインに成功しました！',
    'toast.verifyEmail': '最初にメールを確認してください',
    'toast.invalidCredentials': 'メールまたはパスワードが無効です',
    'toast.userNotFound': 'このメールのアカウントが見つかりません',
    'toast.createAccountFailed': 'アカウント作成に失敗しました',
    'toast.signInFailed': 'サインインに失敗しました',

    "auth.signin.title": "おかえりなさい",
  "auth.signin.subtitle": "アカウントにサインイン",
  "auth.signin.email": "メール",
  "auth.signin.password": "パスワード", 
  "auth.signin.button": "サインイン",
  "auth.signin.noAccount": "アカウントをお持ちでないですか？",
  "auth.signin.demo": "デモアカウント：",
  "auth.signup.title": "アカウント作成",
  "auth.signup.subtitle": "ワンダーラスト・アドベンチャーズに参加",
  "auth.signup.name": "フルネーム",
  "auth.signup.confirmPassword": "パスワード確認",
  "auth.signup.button": "アカウント作成",
  "auth.signup.hasAccount": "すでにアカウントをお持ちですか？",

  // Common - MISSING FROM YOUR CURRENT ja TRANSLATIONS  
  "common.loading": "読み込み中...",
  "common.perPerson": "一人当たり",
  "common.days": "日",
  "common.rating": "評価",
  "common.features": "特徴",
  "common.location": "場所",
  "common.duration": "期間",
  "common.price": "価格",

  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const storedLocale = localStorage.getItem("locale") as Locale;
    if (storedLocale && ["en", "zh", "ja"].includes(storedLocale)) {
      setLocaleState(storedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  const t = (key: string): string => {
    return (
      translations[locale][key as keyof (typeof translations)[typeof locale]] ||
      key
    );
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
