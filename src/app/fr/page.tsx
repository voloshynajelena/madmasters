import { getDictionary } from '@/i18n/dictionaries';
import { HomePage } from '@/components/pages/home-page';

export default function HomeFr() {
  const dict = getDictionary('fr');

  return <HomePage locale="fr" dict={dict} />;
}
