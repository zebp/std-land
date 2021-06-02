import PopulatedHead from '@/components/PopulatedHead';
import styles from '@/styles/Donate.module.css';
import { PropsWithChildren } from 'react';

interface SectionProps {
  name: string;
}

function Section({ name, children }: PropsWithChildren<SectionProps>) {
  return (
    <div className={styles.section}>
      <h1>{name}</h1>
      {children}
    </div>
  );
}

export default function Donate() {
  return (
    <div id={styles.container}>
      <PopulatedHead />

      <div id={styles.inner}>
        <Section name="Why would I donate?">
          Currently I am unemployed and this domain was expensive for a lone
          developer with no income. This site will always be free and not have
          any ads or other shenanigans, but any help with paying for the domain
          (only $40 annually) would be greatly appreciated.
          <br />
          <br />
          Once I have stable income I will no longer be requesting any
          donations.
        </Section>

        <Section name="How can I donate?">
          My BTC address is
          <a
            className={styles.blue}
            href="https://www.blockchain.com/btc/address/bc1qun3qnw4f08dvfm0qeg55wq4n8vsu4fswk5dvcu"
          >
            {` `}
            bc1qun3qnw4f08dvfm0qeg55wq4n8vsu4fswk5dvcu
            {` `}
          </a>
          alternatively my Paypal is
          <a className={styles.blue} href="https://paypal.me/zebp">
            {` `}
            @zebp
          </a>
          .
        </Section>
      </div>
    </div>
  );
}
