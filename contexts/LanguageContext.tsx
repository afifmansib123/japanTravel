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

    //admin

    // Admin Navigation
    "admin.title": "Tour Admin",
    "admin.subtitle": "Management Panel",
    "admin.nav.dashboard": "Dashboard",
    "admin.nav.categories": "Categories",
    "admin.nav.tours": "Tour Packages",
    "admin.nav.bookings": "Bookings",
    "admin.nav.customers": "Customers",
    "admin.nav.locations": "Locations",
    "admin.nav.media": "Media Library",
    "admin.nav.analytics": "Analytics",
    "admin.nav.reports": "Reports",
    "admin.nav.settings": "Settings",
    "admin.nav.logout": "Logout",
    "admin.search": "Search...",

    // Admin Profile
    "admin.profile.name": "Admin User",
    "admin.profile.profile": "Profile",
    "admin.profile.settings": "Settings",
    "admin.profile.logout": "Log out",

    // Dashboard
    "admin.dashboard.title": "Dashboard",
    "admin.dashboard.subtitle": "Overview of your tour business",
    "admin.dashboard.quickActions": "Quick Actions",
    "admin.dashboard.overview": "Overview",
    "admin.dashboard.totalCategories": "Total Categories",
    "admin.dashboard.totalTours": "Total Tours",
    "admin.dashboard.featuredTours": "Featured Tours",
    "admin.dashboard.averagePrice": "Average Price",
    "admin.dashboard.active": "active",
    "admin.dashboard.toursByCategory": "Tours by Category",
    "admin.dashboard.toursByCategoryDesc": "Distribution of tours across categories",
    "admin.dashboard.toursByDifficulty": "Tours by Difficulty",
    "admin.dashboard.toursByDifficultyDesc": "Breakdown by difficulty level",
    "admin.dashboard.recentTours": "Recent Tours",
    "admin.dashboard.recentToursDesc": "Latest tour packages created",
    "admin.dashboard.viewAll": "View All",

    // Quick Actions
    "admin.quickActions.newTour": "Create New Tour",
    "admin.quickActions.newTourDesc": "Add a new tour package",
    "admin.quickActions.newCategory": "Create Category",
    "admin.quickActions.newCategoryDesc": "Add a new tour category",
    "admin.quickActions.viewBookings": "View Bookings",
    "admin.quickActions.viewBookingsDesc": "Manage customer bookings",

    // Difficulty levels
    "admin.difficulty.easy": "Easy",
    "admin.difficulty.moderate": "Moderate",
    "admin.difficulty.challenging": "Challenging",
    "admin.difficulty.extreme": "Extreme",

    // Categories
    "admin.categories.title": "Categories",
    "admin.categories.subtitle": "Manage tour categories",
    "admin.categories.create": "Create Category",
    "admin.categories.edit": "Edit Category",
    "admin.categories.name": "Category Name",
    "admin.categories.description": "Description",
    "admin.categories.slug": "Slug",
    "admin.categories.isActive": "Active",
    "admin.categories.actions": "Actions",
    "admin.categories.noCategories": "No categories found",
    "admin.categories.createFirst": "Create your first category",

    // Tours
    "admin.tours.title": "Tour Packages",
    "admin.tours.subtitle": "Manage your tour packages",
    "admin.tours.create": "Create Tour Package",
    "admin.tours.edit": "Edit Tour Package",
    "admin.tours.name": "Tour Name",
    "admin.tours.description": "Description",
    "admin.tours.shortDescription": "Short Description",
    "admin.tours.category": "Category",
    "admin.tours.location": "Location",
    "admin.tours.duration": "Duration (Days)",
    "admin.tours.price": "Price",
    "admin.tours.discountedPrice": "Discounted Price",
    "admin.tours.currency": "Currency",
    "admin.tours.maxGroupSize": "Max Group Size",
    "admin.tours.difficulty": "Difficulty",
    "admin.tours.images": "Images",
    "admin.tours.highlights": "Highlights",
    "admin.tours.inclusions": "Inclusions",
    "admin.tours.exclusions": "Exclusions",
    "admin.tours.itinerary": "Itinerary",
    "admin.tours.isFeatured": "Featured",
    "admin.tours.isActive": "Active",
    "admin.tours.actions": "Actions",
    "admin.tours.noTours": "No tour packages found",
    "admin.tours.createFirst": "Create your first tour package",

    // Common
    "admin.common.save": "Save",
    "admin.common.cancel": "Cancel",
    "admin.common.delete": "Delete",
    "admin.common.edit": "Edit",
    "admin.common.view": "View",
    "admin.common.loading": "Loading...",
    "admin.common.search": "Search",
    "admin.common.filter": "Filter",
    "admin.common.export": "Export",
    "admin.common.import": "Import",
    "admin.common.refresh": "Refresh",
    "admin.common.yes": "Yes",
    "admin.common.no": "No",
    "admin.common.confirm": "Confirm",
    "admin.common.success": "Success",
    "admin.common.error": "Error",
    "admin.common.required": "Required",
    "admin.common.optional": "Optional",

        "tourDetail.back": "Back to Tours",
    "tourDetail.loading": "Loading tour...",
    "tourDetail.error": "Error",
    "tourDetail.notFound": "Tour not found.",
    "tourDetail.days": "Days",
    "tourDetail.maxGroup": "Max Group Size",
    "tourDetail.difficulty": "Difficulty",
    "tourDetail.about": "About The Tour",
    "tourDetail.highlights": "Tour Highlights",
    "tourDetail.itinerary": "Itinerary",
    "tourDetail.itineraryNotAvailable": "Detailed itinerary information is not available for this tour.",
    "tourDetail.whatsIncluded": "What's Included",
    "tourDetail.inclusions": "Inclusions",
    "tourDetail.exclusions": "Exclusions",
    "tourDetail.ready": "Ready for an adventure?",
    "tourDetail.addToCart": "Add to Cart",
    "tourDetail.askQuestion": "Ask a Question",
    "tourDetail.bookWithConfidence": "Book with confidence.",
    "tourDetail.securePayments": "Secure payments & 24/7 support.",
    "tourDetail.day": "Day" 
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
  "admin.title": "ツアー管理",
    "admin.subtitle": "管理パネル",
    "admin.nav.dashboard": "ダッシュボード",
    "admin.nav.categories": "カテゴリ",
    "admin.nav.tours": "ツアーパッケージ",
    "admin.nav.bookings": "予約",
    "admin.nav.customers": "顧客",
    "admin.nav.locations": "場所",
    "admin.nav.media": "メディアライブラリ",
    "admin.nav.analytics": "分析",
    "admin.nav.reports": "レポート",
    "admin.nav.settings": "設定",
    "admin.nav.logout": "ログアウト",
    "admin.search": "検索...",

    // Admin Profile
    "admin.profile.name": "管理者ユーザー",
    "admin.profile.profile": "プロフィール",
    "admin.profile.settings": "設定",
    "admin.profile.logout": "ログアウト",

    // Dashboard
    "admin.dashboard.title": "ダッシュボード",
    "admin.dashboard.subtitle": "ツアー事業の概要",
    "admin.dashboard.quickActions": "クイックアクション",
    "admin.dashboard.overview": "概要",
    "admin.dashboard.totalCategories": "総カテゴリ数",
    "admin.dashboard.totalTours": "総ツアー数",
    "admin.dashboard.featuredTours": "注目ツアー",
    "admin.dashboard.averagePrice": "平均価格",
    "admin.dashboard.active": "アクティブ",
    "admin.dashboard.toursByCategory": "カテゴリ別ツアー",
    "admin.dashboard.toursByCategoryDesc": "カテゴリ別のツアー分布",
    "admin.dashboard.toursByDifficulty": "難易度別ツアー",
    "admin.dashboard.toursByDifficultyDesc": "難易度レベル別の内訳",
    "admin.dashboard.recentTours": "最新ツアー",
    "admin.dashboard.recentToursDesc": "最近作成されたツアーパッケージ",
    "admin.dashboard.viewAll": "すべて表示",

    // Quick Actions
    "admin.quickActions.newTour": "新しいツアーを作成",
    "admin.quickActions.newTourDesc": "新しいツアーパッケージを追加",
    "admin.quickActions.newCategory": "カテゴリ作成",
    "admin.quickActions.newCategoryDesc": "新しいツアーカテゴリを追加",
    "admin.quickActions.viewBookings": "予約を表示",
    "admin.quickActions.viewBookingsDesc": "顧客の予約を管理",

    // Difficulty levels
    "admin.difficulty.easy": "簡単",
    "admin.difficulty.moderate": "中程度",
    "admin.difficulty.challenging": "困難",
    "admin.difficulty.extreme": "極限",

    // Categories
    "admin.categories.title": "カテゴリ",
    "admin.categories.subtitle": "ツアーカテゴリを管理",
    "admin.categories.create": "カテゴリ作成",
    "admin.categories.edit": "カテゴリ編集",
    "admin.categories.name": "カテゴリ名",
    "admin.categories.description": "説明",
    "admin.categories.slug": "スラッグ",
    "admin.categories.isActive": "アクティブ",
    "admin.categories.actions": "アクション",
    "admin.categories.noCategories": "カテゴリが見つかりません",
    "admin.categories.createFirst": "最初のカテゴリを作成してください",

    // Tours
    "admin.tours.title": "ツアーパッケージ",
    "admin.tours.subtitle": "ツアーパッケージを管理",
    "admin.tours.create": "ツアーパッケージ作成",
    "admin.tours.edit": "ツアーパッケージ編集",
    "admin.tours.name": "ツアー名",
    "admin.tours.description": "説明",
    "admin.tours.shortDescription": "短い説明",
    "admin.tours.category": "カテゴリ",
    "admin.tours.location": "場所",
    "admin.tours.duration": "期間（日数）",
    "admin.tours.price": "価格",
    "admin.tours.discountedPrice": "割引価格",
    "admin.tours.currency": "通貨",
    "admin.tours.maxGroupSize": "最大グループサイズ",
    "admin.tours.difficulty": "難易度",
    "admin.tours.images": "画像",
    "admin.tours.highlights": "ハイライト",
    "admin.tours.inclusions": "含まれるもの",
    "admin.tours.exclusions": "含まれないもの",
    "admin.tours.itinerary": "旅程",
    "admin.tours.isFeatured": "注目",
    "admin.tours.isActive": "アクティブ",
    "admin.tours.actions": "アクション",
    "admin.tours.noTours": "ツアーパッケージが見つかりません",
    "admin.tours.createFirst": "最初のツアーパッケージを作成してください",

    // Common
    "admin.common.save": "保存",
    "admin.common.cancel": "キャンセル",
    "admin.common.delete": "削除",
    "admin.common.edit": "編集",
    "admin.common.view": "表示",
    "admin.common.loading": "読み込み中...",
    "admin.common.search": "検索",
    "admin.common.filter": "フィルター",
    "admin.common.export": "エクスポート",
    "admin.common.import": "インポート",
    "admin.common.refresh": "更新",
    "admin.common.yes": "はい",
    "admin.common.no": "いいえ",
    "admin.common.confirm": "確認",
    "admin.common.success": "成功",
    "admin.common.error": "エラー",
    "admin.common.required": "必須",
    "admin.common.optional": "オプション",

        "tourDetail.back": "返回旅游列表",
    "tourDetail.loading": "正在加载旅游...",
    "tourDetail.error": "错误",
    "tourDetail.notFound": "未找到旅游。",
    "tourDetail.days": "天",
    "tourDetail.maxGroup": "最大团员人数",
    "tourDetail.difficulty": "难度",
    "tourDetail.about": "关于此旅游",
    "tourDetail.highlights": "旅游亮点",
    "tourDetail.itinerary": "行程安排",
    "tourDetail.itineraryNotAvailable": "此旅游没有详细的行程信息。",
    "tourDetail.whatsIncluded": "包含项目",
    "tourDetail.inclusions": "包含",
    "tourDetail.exclusions": "不包含",
    "tourDetail.ready": "准备好开始冒险了吗？",
    "tourDetail.addToCart": "加入购物车",
    "tourDetail.askQuestion": "提问",
    "tourDetail.bookWithConfidence": "放心预订。",
    "tourDetail.securePayments": "安全支付 & 24/7 支持。",
    "tourDetail.day": "第" 
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

  "admin.title": "旅游管理",
    "admin.subtitle": "管理面板",
    "admin.nav.dashboard": "仪表板",
    "admin.nav.categories": "分类",
    "admin.nav.tours": "旅游套餐",
    "admin.nav.bookings": "预订",
    "admin.nav.customers": "客户",
    "admin.nav.locations": "地点",
    "admin.nav.media": "媒体库",
    "admin.nav.analytics": "分析",
    "admin.nav.reports": "报告",
    "admin.nav.settings": "设置",
    "admin.nav.logout": "退出",
    "admin.search": "搜索...",

    // Admin Profile
    "admin.profile.name": "管理员用户",
    "admin.profile.profile": "个人资料",
    "admin.profile.settings": "设置",
    "admin.profile.logout": "退出登录",

    // Dashboard
    "admin.dashboard.title": "仪表板",
    "admin.dashboard.subtitle": "您的旅游业务概览",
    "admin.dashboard.quickActions": "快速操作",
    "admin.dashboard.overview": "概览",
    "admin.dashboard.totalCategories": "总分类数",
    "admin.dashboard.totalTours": "总旅游数",
    "admin.dashboard.featuredTours": "精选旅游",
    "admin.dashboard.averagePrice": "平均价格",
    "admin.dashboard.active": "激活",
    "admin.dashboard.toursByCategory": "按分类统计旅游",
    "admin.dashboard.toursByCategoryDesc": "各分类的旅游分布",
    "admin.dashboard.toursByDifficulty": "按难度统计旅游",
    "admin.dashboard.toursByDifficultyDesc": "按难度级别的分类",
    "admin.dashboard.recentTours": "最新旅游",
    "admin.dashboard.recentToursDesc": "最近创建的旅游套餐",
    "admin.dashboard.viewAll": "查看全部",

    // Quick Actions
    "admin.quickActions.newTour": "创建新旅游",
    "admin.quickActions.newTourDesc": "添加新的旅游套餐",
    "admin.quickActions.newCategory": "创建分类",
    "admin.quickActions.newCategoryDesc": "添加新的旅游分类",
    "admin.quickActions.viewBookings": "查看预订",
    "admin.quickActions.viewBookingsDesc": "管理客户预订",

    // Difficulty levels
    "admin.difficulty.easy": "简单",
    "admin.difficulty.moderate": "中等",
    "admin.difficulty.challenging": "困难",
    "admin.difficulty.extreme": "极限",

    // Categories
    "admin.categories.title": "分类",
    "admin.categories.subtitle": "管理旅游分类",
    "admin.categories.create": "创建分类",
    "admin.categories.edit": "编辑分类",
    "admin.categories.name": "分类名称",
    "admin.categories.description": "描述",
    "admin.categories.slug": "标识符",
    "admin.categories.isActive": "激活",
    "admin.categories.actions": "操作",
    "admin.categories.noCategories": "未找到分类",
    "admin.categories.createFirst": "创建您的第一个分类",

    // Tours
    "admin.tours.title": "旅游套餐",
    "admin.tours.subtitle": "管理您的旅游套餐",
    "admin.tours.create": "创建旅游套餐",
    "admin.tours.edit": "编辑旅游套餐",
    "admin.tours.name": "旅游名称",
    "admin.tours.description": "描述",
    "admin.tours.shortDescription": "简短描述",
    "admin.tours.category": "分类",
    "admin.tours.location": "地点",
    "admin.tours.duration": "持续时间（天）",
    "admin.tours.price": "价格",
    "admin.tours.discountedPrice": "优惠价格",
    "admin.tours.currency": "货币",
    "admin.tours.maxGroupSize": "最大团体规模",
    "admin.tours.difficulty": "难度",
    "admin.tours.images": "图片",
    "admin.tours.highlights": "亮点",
    "admin.tours.inclusions": "包含项目",
    "admin.tours.exclusions": "不包含项目",
    "admin.tours.itinerary": "行程",
    "admin.tours.isFeatured": "精选",
    "admin.tours.isActive": "激活",
    "admin.tours.actions": "操作",
    "admin.tours.noTours": "未找到旅游套餐",
    "admin.tours.createFirst": "创建您的第一个旅游套餐",

    // Common
    "admin.common.save": "保存",
    "admin.common.cancel": "取消",
    "admin.common.delete": "删除",
    "admin.common.edit": "编辑",
    "admin.common.view": "查看",
    "admin.common.loading": "加载中...",
    "admin.common.search": "搜索",
    "admin.common.filter": "筛选",
    "admin.common.export": "导出",
    "admin.common.import": "导入",
    "admin.common.refresh": "刷新",
    "admin.common.yes": "是",
    "admin.common.no": "否",
    "admin.common.confirm": "确认",
    "admin.common.success": "成功",
    "admin.common.error": "错误",
    "admin.common.required": "必填",
    "admin.common.optional": "可选",

        "tourDetail.back": "ツアー一覧へ戻る",
    "tourDetail.loading": "ツアーを読み込み中...",
    "tourDetail.error": "エラー",
    "tourDetail.notFound": "ツアーが見つかりません。",
    "tourDetail.days": "日間",
    "tourDetail.maxGroup": "最大グループ人数",
    "tourDetail.difficulty": "難易度",
    "tourDetail.about": "このツアーについて",
    "tourDetail.highlights": "ツアーのハイライト",
    "tourDetail.itinerary": "旅程",
    "tourDetail.itineraryNotAvailable": "このツアーの詳細な旅程情報はありません。",
    "tourDetail.whatsIncluded": "含まれるもの",
    "tourDetail.inclusions": "含まれるもの",
    "tourDetail.exclusions": "含まれないもの",
    "tourDetail.ready": "冒険の準備はできましたか？",
    "tourDetail.addToCart": "カートに追加",
    "tourDetail.askQuestion": "質問する",
    "tourDetail.bookWithConfidence": "安心してご予約ください。",
    "tourDetail.securePayments": "安全な支払い＆年中無休のサポート。",
    "tourDetail.day": "日目" // For the itinerary

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
