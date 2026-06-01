import BlogAdmin from './BlogAdmin';

export const metadata = {
  title: 'Gerenciar Blog',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BlogAdmin />;
}
