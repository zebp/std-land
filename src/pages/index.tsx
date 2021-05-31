import React from 'react';
import Search from '@/components/Search';
import styles from '../styles/Lookup.module.css';

export default function Home() {
  return (
    <div id={styles.container}>
      <h1 id={styles.title}>std.land</h1>
      <Search query="" results={[]} />
    </div>
  );
}
