import stylesheet from '~/styles/index.css';
import { Counter } from '~/components';
import { IndexRoute as styles } from '~/styles';

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: stylesheet,
    },
  ];
}

export default function Index() {
  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Remix & Vanilla Extract</h1>
      <Counter />
    </div>
  );
}
