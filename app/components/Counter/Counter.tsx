import { useState } from 'react';
import { Counter as styles } from '~/styles';
import { Themed } from '../Themed/Themed';

export const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <Themed
      theme={styles.theme}
      vars={{
        borderColor: 'rebeccapurple',
        backgroundColor: 'papayawhip',
        underlimitValueColor: 'magenta',
        overlimitValueColor: 'darkred',
      }}
      className={styles.root}
    >
      <button className={styles.button} onClick={() => setCount((c) => c - 1)}>
        -
      </button>
      <span className={styles.count({ overlimit: count > 5 })}>{count}</span>
      <button className={styles.button} onClick={() => setCount((c) => c + 1)}>
        +
      </button>
    </Themed>
  );
};
