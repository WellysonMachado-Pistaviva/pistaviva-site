import { notFound } from 'next/navigation';
import HomeLayout from '../components/HomeLayout';

export const metadata = {
  title: { absolute: 'Estudo de layout · Pistaviva' },
  robots: { index: false, follow: false },
};

export default function LayoutPreview() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <HomeLayout preview />;
}
