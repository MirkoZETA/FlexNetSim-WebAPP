import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Hands-on Simulation Demo',
    Svg: require('@site/static/img/computer.svg').default,
    description: (
      <>
        Experience optical network simulation directly through your browser.
      </>
    ),
  },
  {
    title: 'Simplified API Access',
    Svg: require('@site/static/img/simple.svg').default,
    description: (
      <>
        Together with the FNS API, the WebAPP offers a
        simplified interface, making complex simulations approachable for everyone.
      </>
    ),
  },
  {
    title: 'Quick & Easy Experimentation',
    Svg: require('@site/static/img/experimentation.svg').default,
    description: (
      <>
        Experiment with pre-configured network topologies and parameters to quickly understand and test different scenarios.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
