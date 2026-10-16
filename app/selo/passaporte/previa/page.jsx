import { notFound } from 'next/navigation';
import PreviaStory from './PreviaStory';
import '../editor-passaporte.css';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Prévia local do passaporte',
  robots: { index: false, follow: false },
};

export default function PreviaPassaportePage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <PreviaStory />;
}
