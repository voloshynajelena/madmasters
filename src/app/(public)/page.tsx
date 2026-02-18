import { getDictionary } from '@/i18n/dictionaries';
import { HomePage } from '@/components/pages/home-page';

export default function Home() {
  const dict = getDictionary('en');

  return <HomePage locale="en" dict={dict} />;
}
