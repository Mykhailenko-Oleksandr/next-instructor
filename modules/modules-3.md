- Мета-теги
  1. Як перевизначити мета-теги?
  2. Динамічні мета-теги
- Open Graph і Twitter мета-теги
  1. Twitter Cards
- Оптимізація зображень
  1. Зображення з зовнішніх джерел
- Оптимізація шрифтів
  1. Як додати Google-шрифт
- Продуктивність вебзастосунка
- Створення нотатки
  1. Сторінка створення нотатки
  2. Додаємо посилання в сайдбар
  3. Форма створення нотатки
  4. HTTP-запит
- Біліотека Zustand
  1. Особливості TypeScript
- Збереження чорнетки нотатки
  1. Persist: зберігаємо стан у localStorage

# Мета-теги

Мета-теги – це важлива частина SEO, яка впливає на те, як ваша сторінка виглядає в результатах пошуку. Пропонуємо розібратись як з ними працювати у Next.js.

Керування мета-тегами можливе лише у серверних компонентах – логічно, адже весь HTML генерується на сервері.
У будь-якому серверному layout-і або серверній сторінці можна задавати мета-дані.

Приклад: чому сторінка profile має заголовок "Note Hub"?

Цей title береться з layout.tsx, який містить об'єкт metadata. Якщо сторінка сама не перевизначає мета-теги, застосовуються ті, що в layout.

## Як перевизначити мета-теги?

Щоб задати власні мета-теги для сторінки, додайте export const metadata:

// app/profile/edit/page.tsx

import { Metadata } from 'next';

export const metadata: Metadata = {
title: 'Edit Profile',
description: 'Edit your user details and settings',
};

const EditProfile = () => {
return <div>EditProfile</div>;
};

export default EditProfile;

Це також працює для вкладених layout.tsx.

## Динамічні мета-теги

Що робити, якщо мета-дані залежать від динамічного контенту (наприклад, назви нотатки)?

У цьому випадку використовується асинхронна функція generateMetadata():

// app/notes/[id]/page.tsx

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getSingleNote } from '@/lib/api'
import NoteDetailsClient from './NoteDetails.client'

type Props = {
params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
const { id } = await params
const note = await getSingleNote(id)
return {
title: `Note: ${note.title}`,
description: note.content.slice(0, 30),
}
}

const NoteDetails = async ({ params }: Props) => {
const { id } = await params
const queryClient = new QueryClient()

await queryClient.prefetchQuery({
queryKey: ['note', id],
queryFn: () => getSingleNote(id),
})

return (
<HydrationBoundary state={dehydrate(queryClient)}>
<NoteDetailsClient />
</HydrationBoundary>
)
}

export default NoteDetails

Назва нотатки тепер відображається у вкладці браузера:

Чому запит виконується двічі?
Функція generateMetadata() і компонент сторінки – окремі процеси:

- generateMetadata() викликається до рендеру сторінки – для побудови <head>.
- Далі виконується основна логіка компонента знову з тими ж запитами.

Навіщо так зроблено?

- Мета-дані можуть бути потрібні раніше за HTML – для попереднього рендеру або кешу.
- Також, запити для SEO можуть бути легшими/швидшими за повний контент сторінки.

Підсумок

- Мета-теги задаються через export const metadata або generateMetadata().
- metadata – для статичних сторінок.
- generateMetadata() – для динамічного контенту.
- Запити з generateMetadata() не передаються в компонент сторінки.
- Next.js автоматично виводить ці теги в <head> для SEO.

# Open Graph і Twitter мета-теги

Open Graph (OG) – це специфікація, яка дозволяє красиво оформлювати посилання у соцмережах: Facebook, LinkedIn, Telegram, Slack та інших.

Без OG-мета сторінка виглядає як звичайне посилання. З OG соцмережа підтягує дані й показує привабливий банер-контент з заголовком, описом і зображенням.

Як це виглядає в HTML

<meta property="og:title" content="Note: Shopping List" />
<meta property="og:description" content="A short list of groceries to buy on Saturday." />
<meta property="og:image" content="https://placehold.co/1200x630" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://notehub.com/notes/abc123" />
<meta property="og:site_name" content="NoteHub" />

Що можна вказати:

- og:title – заголовок сторінки
- og:description – короткий опис
- og:image – зображення-превʼю (розмір 1200×630 px)
- og:type – тип контенту (часто: website, article)
- og:url – адреса сторінки
- og:site_name – назва сайту

Як задати OG у Next.js

Для фона картки соціальних мереж використаємо ось таке зображення, завантажене на файловий хостинг.

Ось посилання на зображення: https://ac.goit.global/fullstack/react/notehub-og-meta.jpg

Наприклад, на сторінці деталей нотатки ми можемо додати властивість openGraph у generateMetadata():

// app/notes/[id]/page.tsx

export async function generateMetadata({ params }: Props) {
const { id } = await params
const note = await getSingleNote(id)
return {
title: `Note: ${note.title}`,
description: note.content.slice(0, 30),
openGraph: {
title: `Note: ${note.title}`,
description: note.content.slice(0, 100),
url: `https://notehub.com/notes/${id}`,
siteName: 'NoteHub',
images: [
{
url: 'https://ac.goit.global/fullstack/react/og-meta.jpg',
width: 1200,
height: 630,
alt: note.title,
},
],
type: 'article',
},
}
}

Результат – OG-банер у Telegram, Facebook тощо:

## Twitter Cards

Next.js також автоматично генерує Twitter Cards, але їх можна налаштувати вручну через властивість twitter:

// app/notes/[id]/page.tsx

export async function generateMetadata({ params }: Props) {
const { id } = await params
const note = await getSingleNote(id)
return {
title: `Note: ${note.title}`,
description: note.content.slice(0, 30),
openGraph: {
title: `Note: ${note.title}`,
description: note.content.slice(0, 100),
url: `https://notehub.com/notes/${id}`,
siteName: 'NoteHub',
images: [
{
url: 'https://placehold.co/1200x630',
width: 1200,
height: 630,
alt: note.title,
},
],
type: 'article',
},
twitter: {
card: 'summary_large_image',
title: `${note.title}`,
description: note.content.slice(0, 3),
images: ['https://ac.goit.global/fullstack/react/og-meta.jpg'],
},
}
}

- card – визначає формат Twitter-картки. Значення 'summary_large_image' створює картку з великим зображенням і текстом (найпопулярніший варіант). Інші варіанти:
- 'summary' – менша картка з іконкою;
- 'app' – для мобільних застосунків;
- 'player' – для відео/аудіо.
- title – заголовок картки, який відображається під час публікації посилання в Twitter.
- description – короткий опис контенту сторінки. Обмеження – до 200 символів, оптимально – до 100.
- images – масив URL-адрес до зображень. Використовується для попереднього перегляду. Рекомендований розмір: 1200×630 px.

Twitter сам визначає, яке зображення взяти, якщо передано кілька. У більшості випадків краще передавати одне оптимізоване зображення.

Із цих тегів буде сформован Twitter Card:

Важливі нюанси

- Зображення для OG має бути 1200×630 px – це рекомендований стандарт.
- og:url повинен вказувати на реальну адресу сторінки.
  Якщо не вказати og:image:
- соцмережа покаже лише текст або використає заглушку (залежить від платформи).

Висновок

- Open Graph – must-have для сайтів, якими діляться у соцмережах.
- У Next.js все просто – додайте openGraph і twitter в generateMetadata().
- Це не лише про SEO, а й про першу візуальну взаємодію з вашим сайтом – зробіть її якісною.

# Оптимізація зображень

Чому оптимізація критично важлива?

Згідно з дослідженнями Google:

- Понад 50% ваги типового сайту – це зображення
- Кожна секунда затримки = -20% конверсій
- Погано оптимізовані зображення = низький рейтинг SEO, зокрема по показнику Largest Contentful Paint (LCP)

Next.js пропонує компонент <Image /> (з пакету next/image), який значно спрощує оптимізацію зображень.

Що він робить автоматично:

- Lazy loading – завантажує зображення тільки тоді, коли воно потрапляє у зону видимості.
- Автоматичний формат – залежно від браузера, використовує WebP, AVIF або JPEG.
- Ресайзинг – передає зображення лише в потрібному розмірі.
- Адаптивна верстка – підтримка різних розмірів для мобілок, планшетів і десктопів.
- Плейсхолдер – розмиття перед завантаженням зображення (blur effect), щоб уникнути “пригрівань” при прокрутці.

Як використовувати next/image?

Додайте зображення до папки public, наприклад: /public/test.png

Тепер, на головній сторінці, Відобразіть його за допомогою компонента <Image>:

// app/page.tsx

import Image from 'next/image';

const Home = () => {
return (

<section>
<h1>Welcome to Home</h1>
<p>This is the home page.</p>
<Image src="/test.png" alt="test" width={300} height={300} />
</section>
);
};

export default Home;

Обов'язкові пропси:

- src – шлях до зображення (відносно public)
- alt – альтернативний текст (важливо для SEO та доступності)
- width / height – необхідні, бо Next резервує місце під картинку, щоб уникнути “стрибаючого контенту”

Ці пропси є обовʼязковими, без них Next видасть помилку, ось, наприклад, якщо не задати width:

Перевірка lazy loading

Коли зображення знаходиться нижче фолду (тобто не одразу у вікні браузера), воно не буде завантажене одразу. Це економить трафік і покращує продуктивність.

У демо-відео нижче видно, як зображення зʼявляється лише при прокрутці:

Також, в інструментах розробника можна побачити, що формат зображення автоматично змінено на .webp, тобто Next самостійно конвертує зображення у WebP, якщо це можливо.

## Зображення з зовнішніх джерел

Якщо потрібно використовувати зображення з іншого домену (наприклад, з API або CDN), не достатньо просто передати посилання на зображення.

// app/page.tsx

import Image from 'next/image';

const Home = () => {
return (

<section>
<h1>Welcome to Home</h1>
<p>This is the home page.</p>
<Image
        src="https://picsum.photos/seed/picsum/300/300"
        alt="test"
        width={300}
        height={300}
      />
</section>
);
};

export default Home;

Такий код видасть помилку.

При роботі із зовнішніми зображеннями ми маємо вказати домен за яким отримуємо зображення, як дозволений (безпечний) для нашого додатка.

Щоб вирішити проблему, потрібно додати домен picsum.photos до next.config.ts у властивість remotePatters який зберігає масив зовнішніх доменів:

// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
images: {
remotePatterns: [
{ protocol: 'https', hostname: 'picsum.photos' }
]
}
};

export default nextConfig;

Після цього зображення з зовнішнього джерела https://picsum.photos працюватимуть без помилок. Перевіримо:

У тексті будь якої помилки є посилання на документацію, яка все пояснює.

Додаткові можливості Image

Можна керувати поведінкою завантаження зображення через додаткові пропси:

<Image
  src="/hero.jpg"
  alt="hero"
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, 50vw"
  priority
  placeholder="blur"
/>

- sizes – адаптивна ширина в залежності від розміру екрана
- priority – зображення завантажується одразу, без lazy loading
- placeholder="blur" – додає ефект розмиття на час завантаження

Це корисно для Hero-зон, де зображення має зʼявитись миттєво.

Висновки

- Використовуйте <Image /> замість <img> – це покращує продуктивність і UX.
- Завжди додавайте alt, width і height – це обов’язкові поля.
- Додавайте зовнішні домени до next.config.ts, інакше отримаєте помилку.
- За потреби використовуйте опції priority, blur, sizes.

# Оптимізація шрифтів

Коли сайт завантажується, браузер також завантажує шрифти. Якщо це зробити неправильно:

- Текст може спочатку не відображатися взагалі – це називається FOIT
- Або з’являється тимчасовий системний шрифт, який потім різко змінюється – це FOUT
- Через це сторінка виглядає «скачучою» або порожньою
- Google може гірше оцінити ваш сайт – бо текст видно не одразу

Next.js має вбудовану підтримку роботи зі шрифтами через пакет next/font. Він:

- Завантажує шрифти швидко та оптимально
- Вбудовує їх напряму в HTML через @font-face
- Дозволяє легко додавати як Google Fonts, так і локальні шрифти
- Підключає шрифт через CSS-змінну, яку зручно використовувати у стилях

## Як додати Google-шрифт

Прибираємо старі шрифти із компонента RootLayout:

// app/layout.tsx

import type { Metadata } from 'next';
// 1. Видаляємо імпорти старих шрифтів
// import { Geist, Geist_Mono } from 'next/font/google';
import Header from '@/components/Header/Header';
import TanStackProvider from '@/components/TanStackProvider/TanStackProvider';
import './globals.css';

// 2. Видаляємо налаштування старих шрифтів
// const geistSans = Geist({
// variable: '--font-geist-sans',
// subsets: ['latin'],
// });
// const geistMono = Geist_Mono({
// variable: '--font-geist-mono',
// subsets: ['latin'],
// });

export const metadata: Metadata = {
title: 'NoteHub',
description: 'Created by GoIT',
};

export default function RootLayout({
children,
modal,
}: Readonly<{
children: React.ReactNode;
modal: React.ReactNode;
}>) {
return (

<html lang="en">
{/_ 3. Прибираємо старі класи з <body> _/}
{/_ <body className={`${geistSans.variable} ${geistMono.variable}`}> _/}
<body>
<TanStackProvider>
<Header />
<main>
{children}
{modal}
</main>
<footer>
<p>
Created <time dateTime="2025">2025</time>
</p>
</footer>
</TanStackProvider>
</body>
</html>
);
}

Імпортуємо новий шрифт.

import { Roboto } from 'next/font/google';

У прикладі використовуємо Roboto, але можна обрати будь-який шрифт з Google Fonts

Налаштовуємо шрифт.

const roboto = Roboto({
subsets: ['latin'],
weight: ['400', '700'],
variable: '--font-roboto',
display: 'swap',
});

Пояснення параметрів:

- subsets – символи, які використовуватимемо (наприклад, latin – для англійської)
- weight – товщина шрифтів
- variable – назва CSS-змінної
- display: 'swap' – браузер одразу показує текст, навіть якщо шрифт ще не завантажився

Додаємо клас у розмітку.

<body className={roboto.variable}>

Тепер змінна --font-roboto буде доступна у стилях через var(--font-roboto)

Використовуємо шрифт у CSS у файлі globals.css:

/_ app/globals.css _/

body {
color: var(--foreground);
background: var(--background);
font-family: var(--font-roboto), sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}

Повний код файлу src/app/layout.tsx:

// app/layout.tsx

import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import Header from '@/components/Header/Header';
import TanStackProvider from '@/components/TanStackProvider/TanStackProvider';
import './globals.css';

export const metadata: Metadata = {
title: 'NoteHub',
description: 'Created by GoIT',
};

const roboto = Roboto({
subsets: ['latin'],
weight: ['400', '700'],
variable: '--font-roboto',
display: 'swap',
});

export default function RootLayout({
children,
modal,
}: Readonly<{
children: React.ReactNode;
modal: React.ReactNode;
}>) {
return (

<html lang="en">
<body className={roboto.variable}>
<TanStackProvider>
<Header />
<main>
{children}
{modal}
</main>
<footer>
<p>
Created <time dateTime="2025">2025</time>
</p>
</footer>
</TanStackProvider>
</body>
</html>
);
}

Переглянемо результат в браузері.

Що ми отримали

- Браузер завантажує шрифт швидко і без зайвих запитів
- Текст видно одразу – навіть якщо шрифт ще не завантажився
- Немає стрибків тексту
- Немає запитів до fonts.googleapis.com
- Шрифт зручно використовувати через CSS-змінну

# Продуктивність вебзастосунка

Основні метрики продуктивності

Коли ви тестуєте свій сайт, Google аналізує такі показники:

- FCP (First Contentful Paint) – коли щось уперше зʼявляється на екрані (текст або зображення).
- LCP (Largest Contentful Paint) – коли відображається найбільший елемент сторінки (важливо для UX).
- TTI (Time to Interactive) – коли сторінка стає повністю готовою до взаємодії.
- TBT (Total Blocking Time) – скільки часу сторінка "зависає" через виконання JavaScript.
- CLS (Cumulative Layout Shift) – чи стрибають елементи сторінки при завантаженні (наприклад, картинка посунула текст).

Як перевірити продуктивність?

1. Варіант 1 – вкладка Performance у DevTools. У Chrome є вкладка Performance – вона показує, як завантажується сайт, які файли важкі, що блокує рендер тощо.

2. Варіант 2 – розширення Lighthouse. Це зручний аналізатор продуктивності від Google. Він дає оцінки за такими напрямами:

- продуктивності (Performance)
- доступності (Accessibility)
- SEO
- PWA (прогресивний вебзастосунок)

Як протестувати сторінку?

Візьмемо найважчу сторінку: відображення списку нотаток (notes/filter/categoryId).

Вона важка, бо:

- завантажує хедер
- сайдбар із категоріями
- список нотаток
- усе це тягнеться з API

Для запуску аналізу нам потрібно:

- Встановити Lighthouse
- Відкрити потрібну сторінку
- Перезавантажити її (щоб усе підвантажилось наново)
- Відкрити DevTools → вкладка Lighthouse

Відкривши її, ви побачите список налаштувань для аналізу. У нашому випадку важливо:

- отримати результати за всіма доступними категоріями
- обрати Desktop-версію, адже під Mobile ми не розробляли

Натискаємо Analyze page load і чекаємо на результати.

Можемо побачити, що, наприклад, Performance = 98. Це дуже добре – але чому не 100? Щоб зрозуміти, дивимось деталі попереджень:

Щоб розібратися, у чому проблема, перегляньмо деталі кожного попередження.

### Minify JavaScript

Lighthouse каже, що JavaScript не мінімізований. Це нормально – у dev-режимі оптимізації не виконується (щоб зручно було дебажити).

Що з цим робити? Нічого – ми працюємо в dev-режимі, проєкт запущено через npm run dev. Мінімізація вимкнена навмисно для зручності розробки.

### Reduce unused JavaScript

Завантажується багато зайвого JavaScript. Це також очікувано у dev, бо працює hot reload, інструменти дебагу тощо.

### Page prevented back/forward cache

Браузер не кешує сторінку для швидкого повернення назад/вперед. Причина – активне WebSocket-з’єднання, яке використовується для hot reload у dev-режимі. Це специфіка середовища розробки.

Тобто ми знову вперлися в те, що dev-режим ламає нам аналіз.

Як зробити нормальний аналіз?

Для повноцінного тестування продуктивності потрібно запустити застосунок у production-режимі, як це відбувається, наприклад, на Vercel.

Спочатку збираємо продакшен-версію додатка – вона міститиме мініфікацію, оптимізацію зображень, tree shaking тощо:

npm run build

Далі запускаємо зібраний бандл на localhost:

npm run start

Переходимо на сторінку та запускаємо Lighthouse повторно – і бачимо інші результати.

Проте й тут зʼявляється попередження про заголовок Cache-Control:

У вкладці Network знаходимо HTML-файл типу document і перевіряємо заголовки. Якщо там no-cache – сторінка не кешується.

Це відбувається тому, що сторінка – асинхронна серверна, і Next.js не знає, як часто її можна оновлювати. Тому кешування потрібно прописати вручну.

Як додати кешування?

У файлі next.config.ts налаштуйте кешування для поточної сторінки:

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
images: {
domains: ['picsum.photos'],
},
async headers() {
return [
{
source: '/notes/filter/:slug', // маршрут сторінки
locale: false,
headers: [
{
key: 'Cache-Control', // Заголовок
value: 'public, max-age=300, must-revalidate', // кешуємо на 5 хв
},
],
},
]
}
};

export default nextConfig;

Після цього знову збираємо і запускаємо проєкт:

npm run build
npm run start

У заголовках тепер буде правильне кешування:

І можна знову запустити перевірку через Lighthouse:

Висновок

- Dev-режим повільний навмисно – не використовуйте його для аналізу.
- Аналізуйте тільки production-збірку.
- Основні метрики: FCP, LCP, TTI, TBT, CLS.
- Якщо бачите попередження – перевіряйте, чи воно справді актуальне.
- Додавайте кешування для серверних сторінок, які часто відвідуються.

# Створення нотатки

У цьому блоці ми реалізуємо можливість створення нової нотатки. Для цього потрібно:

- створити окрему сторінку;
- додати посилання в сайдбар;
- реалізувати форму;
- виконати HTTP-запит.

## Сторінка створення нотатки

Почнемо зі сторінки за шляхом /notes/action/create/page.tsx.

// app/notes/action/create/page.tsx

import { getCategories } from '@/lib/api';

const CreateNote = async () => {
const categories = await getCategories();
return <div>CreateNote</div>;
};

export default CreateNote;

Оскільки ми хочемо одразу показати список категорій, які будуть у випадаючому списку форми, то додаємо асинхронний виклик getCategories().

Чому не /notes/create? Тому що у нас уже є сторінка /notes/[id], і Next вважатиме create за динамічний параметр id, а не окрему сторінку. Саме тому ми робимо notes/action/create.

## Додаємо посилання в сайдбар

Переходимо до компонента сайдбара, який підключено в лейауті @sidebar. Посилання Create note веде нас на сторінку створення нотатки.

// app/(public routes)/notes/filter/@sidebar/default.tsx

import Link from 'next/link';
import { getCategories } from '@/lib/api';

const NotesSidebar = async () => {
const categories = await getCategories();

return (
<>

<Link href="/notes/action/create">Create note</Link>
<ul>
<li>
<Link href={`/notes/filter/all`}>All notes</Link>
</li>
{categories.map((category) => (
<li key={category.id}>
<Link href={`/notes/filter/${category.id}`}>{category.name}</Link>
</li>
))}
</ul>
</>
);
};

export default NotesSidebar;

## Форма створення нотатки

Форма має містити:

- поле для заголовка;
- поле для контенту;
- випадаючий список із категоріями.

// components/NoteForm/NoteForm.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Category } from '@/lib/api';

type Props = {
categories: Category[];
};

const NoteForm = ({ categories }: Props) => {
const router = useRouter();
const handleCancel = () => router.push('/notes/filter/all');

const handleSubmit = (formData: FormData) => {
const values = Object.fromEntries(formData);
console.log(values);
};

return (

<form action={handleSubmit}>
<label>
Title
<input type="text" name="title" />
</label>

      <label>
        Content
        <textarea name="content"></textarea>
      </label>

      <label>
        Category
        <select name="category">
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <button type="submit">Create</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
      </div>
    </form>

);
};

export default NoteForm;

Кнопка Cancel повертає користувача назад на сторінку зі списком нотаток. Для цього ми використовуємо router.push().

Підключаємо форму на сторінці:

// app/notes/action/create

import { getCategories } from '@/lib/api';
import NoteForm from '@/components/NoteForm/NoteForm';

const CreateNote = async () => {
const categories = await getCategories();

return (
<>
<NoteForm categories={categories} />
</>
);
};

export default CreateNote;

## HTTP-запит

Тепер створимо функцію для відправлення даних на сервер.

// lib/api.ts

export type NewNoteData = {
title: string;
content: string;
categoryId: string;
};

export const createNote = async (data: NewNoteData) => {
const res = await axios.post<Note>('/notes', data);
return res.data;
};

Далі використаємо createNote у формі.

// components/NoteForm/NoteForm.tsx

'use client';

import { useMutation } from '@tanstack/react-query';
import { Category, createNote, NewNoteData } from '@/lib/api';

type Props = {
categories: Category[];
};

const NoteForm = ({ categories }: Props) => {
const { mutate } = useMutation({
mutationFn: createNote,
onSuccess: () => {
router.push('/notes/filter/all');
},
});

const handleSubmit = (formData: FormData) => {
const values = Object.fromEntries(formData) as NewNoteData;
mutate(values);
};

// Решта коду компонента

return (

<form action={handleSubmit}>
{/_ JSX форми _/}
</form>
);
};

export default NoteForm;

- Використовуємо useMutation для надсилання POST-запиту.
- Якщо нотатку успішно створено (onSuccess) – робимо редірект на сторінку всіх нотаток.
- Object.fromEntries(formData) перетворює FormData у звичайний обʼєкт.
- as NewNoteData – приводимо тип, щоб TypeScript не сварився.

В результаті це виглядає наступним чином:

Висновок

- Ми зробили окрему сторінку для створення нотатки.
- Реалізували форму з усіма потрібними полями.
- Використали axios та TanStack Query для надсилання POST-запиту.
- Додали навігацію назад після створення.

# Біліотека Zustand

Zustand – це легка та сучасна бібліотека для керування станом у React-додатках. Вона дозволяє створювати централізоване "сховище стану" (store) без зайвої складності, як у Redux чи інших подібних рішеннях. Це чудовий вибір, якщо потрібно ділитись даними між компонентами або уникати надмірної передачі props.

Основні переваги:

- Мінімум шаблонного коду – створення стору займає кілька рядків.
- Висока продуктивність – компонент оновлюється тільки тоді, коли змінюється саме та частина стану, яку він використовує.
- Простий API – легко інтегрується в будь-який React або Next.js-проєкт.

Встановлення:

npm install zustand

Коли потрібен Zustand?

1. Дані потрібні у багатьох компонентах, які не пов’язані напряму (не батько-дитина).

2. Ви передаєте занадто багато props, що ускладнює структуру компонентів.

3. Потрібно глобально керувати певною функціональністю, наприклад:

- Темна/світла тема
- Відкриття та закриття модальних вікон
- Таймери, лічильники
- Дані користувача, мова інтерфейсу, кошик тощо

Як це працює?

Zustand дозволяє створити стор – єдине місце, де зберігається певний стан (наприклад, лічильник), разом із функціями для його оновлення.

Ми використовуємо функцію create() з бібліотеки Zustand. Вона повертає хук, який ми викликаємо в компонентах, щоб отримати або оновити стан.

Приклад: глобальний лічильник

Імпорт функції create:

// stores/counterStore.ts

import { create } from 'zustand';

Це основна функція, яка створює стор. Вона повертає хук, який ви потім будете використовувати у компонентах.

Описуємо тип стану:

// stores/counterStore.ts

import { create } from 'zustand';

type CounterStore = {
count: number;
increment: () => void;
};

Маємо два елементи:

- count – число, яке ми будемо збільшувати
- increment – функція, яка буде це число збільшувати

Створення глобального стану:

// stores/counterStore.ts

import { create } from 'zustand';

type CounterStore = {
count: number;
increment: () => void;
};

export const useCounterStore = create<CounterStore>()((set) => ({
count: 0,
increment: () => set((state) => ({ count: state.count + 1 })),
}));

Що тут відбувається:

- useCounterStore – це хук, який ми будемо викликати у компонентах.
- count: 0 – початкове значення лічильника.
- set – функція, яка дозволяє оновити стан.
- increment – функція, яка збільшує count на 1, використовуючи попередній стан (state).

## Особливості TypeScript

Zustand має специфічний синтаксис при роботі з TypeScript. Якщо ви використовуєте типізацію, то замість create(...) потрібно писати create<T>()(...).

- T – це тип, який описує структуру стану (наприклад, CounterStore).
- Пара додаткових дужок () потрібна, щоб правильно викликати функцію.

Це виглядає дещо незвично, але це стандартний код створення стора і ви отримуєте повний автокомпліт та перевірку типів в усьому проєкті.

Використання у компоненті

У будь-якому клієнтському компоненті, нам потрібно викликати створений нами хук useCounterStore, та отримати з нього потрібний елемент стану (дані або функцію).

// components/Counter.tsx

'use client';

import { useCounterStore } from '@/stores/counterStore';

export const Counter = () => {
const { count, increment } = useCounterStore();

return <button onClick={increment}>Click: {count}</button>;
};

- Ми викликаємо хук useCounterStore() і деструктуризуємо з нього значення.
- Стан доступний одразу – без жодного контексту чи провайдерів.

Проблема зайвих рендерів

Якщо у сторі є кілька полів, і компонент використовує лише одне, він все одно буде оновлюватись, коли змінюється будь-яке поле.

// stores/counterStore.ts

const useStore = create()((set) => ({
count: 0,
lang: 'en',
increment: () => set((state) => ({ count: state.count + 1 })),
setLang: (lang: string) => set({ lang }),
}));

Навіть якщо компонент використовує тільки count, він оновиться при зміні lang. Це може вплинути на продуктивність, якщо таких компонентів багато.

Вирішенням цієї проблеми є селектори – це функції, які "читають" зі стора лише ту частину стану, яка нам потрібна.

// components/Counter.tsx

'use client';

import { useCounterStore } from '@/stores/counterStore';

export const Counter = () => {
const count = useCounterStore((state) => state.count);
const increment = useCounterStore((state) => state.increment);

return <button onClick={increment}>Click: {count}</button>;
};

Цей варіант набагато кращий:

- Компонент буде оновлюватись тільки при зміні count
- Якщо зміниться, наприклад, lang, цей компонент не оновиться

Рекомендується підписуватись тільки на ту частину стану, яка вам потрібна. Це зменшує кількість ререндерів і покращує продуктивність.

Підсумок

Zustand – це простий, продуктивний і зручний спосіб керування глобальним станом у React/Next.js. У нього мінімум коду, максимум контролю. Він підходить як для маленьких, так і для великих застосунків.

- Ви створюєте стільки стораів, скільки потрібно
- Кожен стор – це просто звичайний хук
- Жодних обгорток, провайдерів або складної конфігурації

# Збереження чорнетки нотатки

Іноді користувач заповнює форму, але з якихось причин залишає сторінку, не натиснувши “створити”. Було б зручно, якби при поверненні дані, які він вводив, не зникали. Для цього ми використаємо Zustand, щоб зберігати чернетку нотатки.

Створення стора для чернетки

Створимо новий файл lib/stores/noteStore.ts і опишемо глобальний стан чернетки.

// app/lib/stores/noteStore.ts

import { create } from 'zustand';
import { NewNoteData } from '../api';

type NoteDraftStore = {
draft: NewNoteData;
setDraft: (note: NewNoteData) => void;
clearDraft: () => void;
};

const initialDraft: NewNoteData = {
title: '',
content: '',
categoryId: '',
};

export const useNoteDraftStore = create<NoteDraftStore>()((set) => ({
draft: initialDraft,
setDraft: (note) => set(() => ({ draft: note })),
clearDraft: () => set(() => ({ draft: initialDraft })),
}));

Що тут відбувається?

- draft – це об’єкт чернетки, який містить поля майбутньої нотатки.
- initialDraft – початкове значення чернетки: усі поля порожні.
- setDraft – оновлює чернетку при зміні будь-якого поля.
- clearDraft – очищує чернетку (наприклад, після успішного сабміту).

Використання чернетки у формі

Далі підключимо збереження чернетки у формі створення нотатки.

// components/NoteForm/NoteForm.tsx

'use client';

import { Category, createNote, NewNoteData } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
// 1. Імпортуємо хук
import { useNoteDraftStore } from '@/lib/stores/noteStore';

type Props = {
categories: Category[];
};

const NoteForm = ({ categories }: Props) => {
const router = useRouter();
// 2. Викликаємо хук і отримуємо значення
const { draft, setDraft, clearDraft } = useNoteDraftStore();
// 3. Оголошуємо функцію для onChange щоб при зміні будь-якого
// елемента форми оновити чернетку нотатки в сторі
const handleChange = (
event: React.ChangeEvent<
HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement >,
) => {
// 4. Коли користувач змінює будь-яке поле форми — оновлюємо стан
setDraft({
...draft,
[event.target.name]: event.target.value,
});
};

const { mutate } = useMutation({
mutationFn: createNote,
// 5. При успішному створенні нотатки очищуємо чернетку
onSuccess: () => {
clearDraft();
router.push('/notes/filter/all');
},
});

const handleSubmit = (formData: FormData) => {
const values = Object.fromEntries(formData) as NewNoteData;
mutate(values);
};

const handleCancel = () => router.push('/notes/filter/all');

    // 6. До кожного елемента додаємо defaultValue та onChange
    // щоб задати початкове значення із чернетки
    // та при зміні оновити чернетку в сторі

return (

<form className={styles.form} action={handleSubmit}>
<label className={styles.label}>
Title
<input type="text" name="title" defaultValue={draft?.title} onChange={handleChange} />
</label>

      <label className={styles.label}>
        Content
        <textarea name="content" defaultValue={draft?.content} onChange={handleChange}></textarea>
      </label>

      <label className={styles.label}>
        Category
        <select name="category" defaultValue={draft?.categoryId} onChange={handleChange} >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.actions}>
        <button type="submit">Create</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
      </div>
    </form>

);
};

export default NoteForm;

- defaultValue={draft.title} – при відкритті сторінки, поля форми заповнюються чернеткою.
- onChange={handleChange} – при кожній зміні поля, чернетка оновлюється.
- clearDraft() – очищення чернетки після створення нотатки.

Ми не використовуємо окремі селектори, тому що цей стор буде використовуватись лише в компоненті форми, тому ніщо не викличе зайвих оновлень.

## Persist: зберігаємо стан у localStorage

На даному етапі чернетка зберігається лише в оперативній пам’яті браузера. Якщо користувач перезавантажить сторінку або випадково закриє вкладку – усі дані зникнуть.

Щоб зберігати чернетку навіть після перезавантаження, додамо persist – middleware, що зберігає стан у localStorage.

// app/lib/stores/noteStore.ts

import { create } from 'zustand';
// 1. Імпортуємо функцію
import { persist } from 'zustand/middleware';
import { NewNoteData } from '../api';

type NoteDraftStore = {
draft: NewNoteData;
setDraft: (note: NewNoteData) => void;
clearDraft: () => void;
};

const initialDraft: NewNoteData = {
title: '',
content: '',
categoryId: '',
};

export const useNoteDraftStore = create<NoteDraftStore>()(
// 2. Обгортаємо функцію створення стора
persist(
(set) => ({
draft: initialDraft,
setDraft: (note) => set(() => ({ draft: note })),
clearDraft: () => set(() => ({ draft: initialDraft })),
}),
{
// Ключ у localStorage
name: 'note-draft',
// Зберігаємо лише властивість draft
partialize: (state) => ({ draft: state.draft }),
},
),
);

- persist – обгортає створення стора.
- name: 'note-draft' – це ключ, під яким буде зберігатися стан у localStorage.
- partialize – вказує, що ми хочемо зберігати лише draft, без функцій setDraft і clearDraft.

Підсумок

- Zustand допомагає зберігати чернетку в памʼяті під час заповнення форми.
- Persist зберігає її у localStorage, навіть після перезавантаження.
- Користувач не втрачає дані, якщо випадково залишив сторінку або закрив вкладку.
- Після створення нотатки чернетка очищується автоматично.

Це невелике покращення UX, але воно дуже помітне – зберігає час і нерви користувачів.
