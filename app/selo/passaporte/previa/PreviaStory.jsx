'use client';
import EditorPassaporte from '../EditorPassaporte';
import cidadesExemplo from './cidades-exemplo.json';

export default function PreviaStory() {
  return <EditorPassaporte demonstracao standalone cidadesExemplo={cidadesExemplo} numero={95} />;
}
